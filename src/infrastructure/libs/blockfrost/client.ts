/**
 * DI-friendly wrapper around `@blockfrost/blockfrost-js` for the civicship
 * Cardano anchoring pipeline (§5.1.5).
 *
 * Responsibilities:
 *   - Pick the correct Blockfrost endpoint for the configured `ChainNetwork`
 *     (`CARDANO_MAINNET` / `CARDANO_PREPROD`)
 *   - Read `BLOCKFROST_PROJECT_ID` from the environment at construction time
 *     (Secret Manager populates the env in production) and fail fast on
 *     missing / mismatched configuration
 *   - Provide a small, intent-revealing surface that the upstream
 *     anchoring usecases need (protocol params / utxos / submit / metadata
 *     / await confirmation)
 *   - Apply a single retry policy with exponential backoff so callers don't
 *     have to special-case transient 5xx / network errors
 *
 * Non-goals:
 *   - This module does NOT manage transactions, signing keys, or DB state —
 *     `cardano/txBuilder.ts` (§5.1.6) and the anchoring service (§5.3.x)
 *     own those concerns.
 *   - DI registration in `provider.ts` is intentionally deferred until the
 *     domain service PR (per the Phase 1 step-4 task brief).
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.5  (this client)
 *   docs/report/did-vc-internalization.md §3.4    (採用ライブラリ)
 *   docs/report/did-vc-internalization.md §4.1    (ChainNetwork enum)
 */

import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import { injectable } from "tsyringe";
import logger from "@/infrastructure/logging";

/** Subset of the `ChainNetwork` enum (§4.1) that civicship anchoring uses. */
export type CardanoChainNetwork = "CARDANO_MAINNET" | "CARDANO_PREPROD";

/** Maps the civicship-internal enum to Blockfrost's network token. */
const NETWORK_BY_ENUM = {
  CARDANO_MAINNET: "mainnet",
  CARDANO_PREPROD: "preprod",
} as const satisfies Record<CardanoChainNetwork, "mainnet" | "preprod">;

/**
 * Heuristic project_id prefix → network mapping. Blockfrost issues
 * project_ids with a network prefix (`mainnet…`, `preprod…`, `preview…`),
 * so we can detect a misconfiguration early without an API round-trip.
 *
 * If the prefix is unknown (e.g. test fixture, future network) we skip the
 * check rather than guess wrong.
 */
const PROJECT_ID_PREFIX_BY_NETWORK: Record<CardanoChainNetwork, readonly string[]> = {
  CARDANO_MAINNET: ["mainnet"],
  CARDANO_PREPROD: ["preprod"],
};

const KNOWN_PROJECT_PREFIXES = ["mainnet", "preprod", "preview", "sanchonet"] as const;

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_INITIAL_BACKOFF_MS = 250;
const DEFAULT_AWAIT_TIMEOUT_MS = 5 * 60 * 1000;
const DEFAULT_AWAIT_POLL_INTERVAL_MS = 5 * 1000;

/** Constructor options. All fields are optional; sensible defaults apply. */
export interface BlockfrostClientOptions {
  /** Civicship-internal network enum. Defaults to `CARDANO_PREPROD`. */
  network?: CardanoChainNetwork;
  /** Override `BLOCKFROST_PROJECT_ID` (testing / scripted overrides). */
  projectId?: string;
  /** Max attempts including the initial call. Defaults to 3. */
  maxRetries?: number;
  /** Initial backoff in ms (doubles each retry). Defaults to 250 ms. */
  initialBackoffMs?: number;
}

/** Awaitable subset of the `txs` response we actually rely on. */
export interface BlockfrostTxResponse {
  hash: string;
  block_height: number | null;
  block_time: number | null;
  [key: string]: unknown;
}

/** Awaitable subset of `addressesUtxosAll` items (§5.1.6 BlockfrostUtxo). */
export interface BlockfrostUtxoResponse {
  tx_hash: string;
  output_index: number;
  amount: { unit: string; quantity: string }[];
  [key: string]: unknown;
}

/** Awaitable subset of `epochsLatestParameters` (§5.1.6 BlockfrostProtocolParams). */
export interface BlockfrostProtocolParamsResponse {
  min_fee_a: number;
  min_fee_b: number;
  pool_deposit: string;
  key_deposit: string;
  max_val_size: string;
  max_tx_size: number;
  coins_per_utxo_size: string;
  [key: string]: unknown;
}

/** Awaitable subset of a `txsMetadata` row. */
export interface BlockfrostTxMetadataRow {
  label: string;
  json_metadata: unknown;
  [key: string]: unknown;
}

/** Sleep helper for backoff. Module-private, exported for tests only. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Best-effort detection of a transient error worth retrying. We retry on
 * 5xx, 429 ("too many requests"), and network-level failures; 4xx that
 * isn't 429 is surfaced immediately.
 */
function isRetryableError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const status =
    (err as { status_code?: number }).status_code ??
    (err as { response?: { status?: number } }).response?.status;
  if (typeof status === "number") {
    return status >= 500 || status === 429;
  }
  const code = (err as { code?: string }).code;
  // Common Node fetch / got network error codes worth retrying.
  if (typeof code === "string") {
    return [
      "ECONNRESET",
      "ETIMEDOUT",
      "ENOTFOUND",
      "EAI_AGAIN",
      "ECONNREFUSED",
      "EPIPE",
      "EHOSTUNREACH",
    ].includes(code);
  }
  return false;
}

/**
 * Throw if the configured network and the project_id prefix don't agree.
 * Helps catch the classic "preprod project on mainnet" / vice-versa
 * misconfiguration at boot time rather than after a failed anchor submit.
 *
 * Exported so tests can exercise the validation without instantiating the
 * SDK.
 */
export function assertProjectIdMatchesNetwork(
  network: CardanoChainNetwork,
  projectId: string,
): void {
  const expected = PROJECT_ID_PREFIX_BY_NETWORK[network];
  // If the project_id doesn't start with any known prefix, we accept it
  // (e.g. a test fixture or a future network we haven't taught this
  // module yet).
  const detectedPrefix = KNOWN_PROJECT_PREFIXES.find((p) => projectId.startsWith(p));
  if (!detectedPrefix) return;
  if (!expected.includes(detectedPrefix)) {
    throw new Error(
      `BLOCKFROST_PROJECT_ID network "${detectedPrefix}" does not match ` +
        `configured network "${network}". Refusing to start to prevent ` +
        `anchoring the wrong chain.`,
    );
  }
}

@injectable()
export class BlockfrostClient {
  private readonly api: BlockFrostAPI;
  private readonly maxRetries: number;
  private readonly initialBackoffMs: number;
  private readonly network: CardanoChainNetwork;

  constructor(options: BlockfrostClientOptions = {}) {
    const network = options.network ?? "CARDANO_PREPROD";
    const projectId = options.projectId ?? process.env.BLOCKFROST_PROJECT_ID;

    if (!projectId) {
      throw new Error("BLOCKFROST_PROJECT_ID is not set; BlockfrostClient cannot be constructed.");
    }
    assertProjectIdMatchesNetwork(network, projectId);

    this.network = network;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.initialBackoffMs = options.initialBackoffMs ?? DEFAULT_INITIAL_BACKOFF_MS;

    this.api = new BlockFrostAPI({
      projectId,
      network: NETWORK_BY_ENUM[network],
    });
  }

  /** Returns the configured network (useful for diagnostics / logging). */
  getNetwork(): CardanoChainNetwork {
    return this.network;
  }

  /**
   * Run `op` with retry + exponential backoff. Stops retrying for 4xx
   * (except 429) — those are caller-side errors, not transient.
   *
   * Implemented recursively so that each call either returns a value or
   * throws — there is no loop, no unreachable trailing branch, and no
   * dead-store accumulator. Recursion depth is bounded by `maxRetries`
   * (default 3), well within stack limits.
   */
  private async withRetry<T>(
    label: string,
    op: () => Promise<T>,
    attempt = 0,
  ): Promise<T> {
    try {
      return await op();
    } catch (err) {
      const isLastAttempt = attempt >= this.maxRetries - 1;
      if (!isRetryableError(err) || isLastAttempt) {
        logger.error("[BlockfrostClient] non-retryable error", {
          label,
          attempt,
          err: serialiseError(err),
        });
        throw err;
      }
      const backoff = this.initialBackoffMs * 2 ** attempt;
      logger.warn("[BlockfrostClient] retry after transient error", {
        label,
        attempt,
        backoff,
        err: serialiseError(err),
      });
      await sleep(backoff);
      return this.withRetry(label, op, attempt + 1);
    }
  }

  /** §5.1.5 `getProtocolParams()` → `epochsLatestParameters()`. */
  async getProtocolParams(): Promise<BlockfrostProtocolParamsResponse> {
    return this.withRetry(
      "getProtocolParams",
      () => this.api.epochsLatestParameters() as Promise<BlockfrostProtocolParamsResponse>,
    );
  }

  /** §5.1.5 `getUtxos(address)` → `addressesUtxosAll`. */
  async getUtxos(address: string): Promise<BlockfrostUtxoResponse[]> {
    return this.withRetry(
      "getUtxos",
      () => this.api.addressesUtxosAll(address) as Promise<BlockfrostUtxoResponse[]>,
    );
  }

  /**
   * §5.1.5 `submitTx(cborHex)` → `txSubmit`.
   *
   * The SDK accepts a `Uint8Array` of raw CBOR bytes (NOT a hex string).
   * Returns the resulting tx hash.
   */
  async submitTx(cborBytes: Uint8Array): Promise<string> {
    return this.withRetry("submitTx", () => this.api.txSubmit(cborBytes));
  }

  /** §5.1.5 `getTxMetadata(hash)` → `txsMetadata`. */
  async getTxMetadata(hash: string): Promise<BlockfrostTxMetadataRow[]> {
    return this.withRetry(
      "getTxMetadata",
      () => this.api.txsMetadata(hash) as Promise<BlockfrostTxMetadataRow[]>,
    );
  }

  /**
   * §5.1.5 `awaitConfirmation(hash, timeoutMs?)` → polls `txs`.
   *
   * Resolves with the tx record once Blockfrost reports the tx has been
   * included in a block (`block_height !== null`). Rejects after
   * `timeoutMs` (default 5 minutes) — the caller is expected to retry on
   * the next poll cycle / batch run rather than block forever.
   *
   * Uses a fresh attempt loop (not `withRetry`) because we explicitly
   * want to wait through 404s while the tx propagates: a missing tx
   * during the polling window is not an error to escalate.
   */
  async awaitConfirmation(
    hash: string,
    timeoutMs: number = DEFAULT_AWAIT_TIMEOUT_MS,
    pollIntervalMs: number = DEFAULT_AWAIT_POLL_INTERVAL_MS,
  ): Promise<BlockfrostTxResponse> {
    const deadline = Date.now() + timeoutMs;
    let attempt = 0;
    while (Date.now() < deadline) {
      try {
        const tx = (await this.api.txs(hash)) as BlockfrostTxResponse;
        if (tx.block_height !== null) {
          return tx;
        }
      } catch (err) {
        // 404 is expected while the tx is still propagating; bail on
        // anything else unless it looks transient.
        if (!isLikelyNotFound(err) && !isRetryableError(err)) {
          throw err;
        }
        logger.debug("[BlockfrostClient] awaitConfirmation poll miss", {
          hash,
          attempt,
          err: serialiseError(err),
        });
      }
      attempt += 1;
      const remaining = deadline - Date.now();
      if (remaining <= 0) break;
      await sleep(Math.min(pollIntervalMs, remaining));
    }
    throw new Error(`awaitConfirmation timed out after ${timeoutMs}ms for tx ${hash}`);
  }
}

function isLikelyNotFound(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const status =
    (err as { status_code?: number }).status_code ??
    (err as { response?: { status?: number } }).response?.status;
  return status === 404;
}

function serialiseError(err: unknown): Record<string, unknown> {
  if (!err || typeof err !== "object") return { value: String(err) };
  const e = err as Record<string, unknown>;
  return {
    name: e.name,
    message: e.message,
    code: e.code,
    status_code: e.status_code,
  };
}
