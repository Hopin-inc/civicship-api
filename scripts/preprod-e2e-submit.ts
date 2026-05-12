#!/usr/bin/env -S node --experimental-strip-types
/**
 * End-to-end PoC: submit a real anchor-batch-shaped tx to Cardano preprod.
 *
 * Unlike `cardano-canary.ts` (which only dry-runs metadata construction),
 * this script actually:
 *   1. Builds a fully-signed Transaction via the production txBuilder
 *   2. Submits it through BlockfrostClient.submitTx
 *   3. Awaits confirmation
 *
 * Intended for one-shot Phase 1 validation that
 *   BLOCKFROST_PROJECT_ID + CARDANO_PLATFORM_PRIVATE_KEY_HEX + funded
 *   CARDANO_PLATFORM_ADDRESS
 * combine into a working anchoring pipeline. Once green, the weekly
 * Cloud Run Job is expected to behave identically.
 *
 * Required env:
 *   BLOCKFROST_PROJECT_ID              `preprod...` Blockfrost key.
 *   CARDANO_PLATFORM_PRIVATE_KEY_HEX   32-byte Ed25519 seed (64 hex chars).
 *   CARDANO_PLATFORM_ADDRESS           bech32 address that owns the UTXOs.
 *
 * Optional env:
 *   CARDANO_NETWORK                    "preprod" (default) | "mainnet"
 *                                      — mainnet is hard-refused by this
 *                                      script even if set.
 *   PREPROD_E2E_AWAIT_TIMEOUT_MS       awaitConfirmation timeout
 *                                      (default 360_000 = 6 min).
 *
 * Exit codes: 0 = PASS, 1 = FAIL.
 *
 * SAFETY:
 *   - Refuses to run against mainnet under any configuration.
 *   - Verifies the derived address matches CARDANO_PLATFORM_ADDRESS before
 *     spending anything (catches a wrong-seed pairing before the faucet
 *     funds are consumed for nothing).
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.5 / §5.1.6 / §5.3.1
 *   docs/operations/anchor-batch-deploy-checklist.md
 */

import { BlockFrostAPI } from "@blockfrost/blockfrost-js";

import {
  BlockfrostClient,
  type BlockfrostProtocolParamsResponse,
  type BlockfrostUtxoResponse,
} from "../src/infrastructure/libs/blockfrost/client.ts";
import { deriveCardanoKeypair } from "../src/infrastructure/libs/cardano/keygen.ts";
import {
  buildAnchorTx,
  type BuildAnchorTxOutput,
} from "../src/infrastructure/libs/cardano/txBuilder.ts";
import {
  parseFixedLengthHex,
  runStep,
  type StepResult,
} from "./lib/cardanoScriptHelpers.ts";
import { buildSampleAuxiliaryData } from "./lib/sampleAnchorMetadata.ts";

const DEFAULT_AWAIT_TIMEOUT_MS = 6 * 60 * 1000;
const PREPROD_EXPLORER_TX = "https://preprod.cardanoscan.io/transaction";

interface PreprodEnv {
  projectId: string;
  seedHex: string;
  address: string;
}

interface ChainSnapshot {
  params: BlockfrostProtocolParamsResponse;
  utxos: BlockfrostUtxoResponse[];
  currentSlot: number;
}

function requirePreprodEnv(): PreprodEnv {
  const projectId = process.env.BLOCKFROST_PROJECT_ID;
  if (!projectId) {
    throw new Error("BLOCKFROST_PROJECT_ID is unset.");
  }
  if (!projectId.startsWith("preprod")) {
    throw new Error(
      `BLOCKFROST_PROJECT_ID must be a preprod key (prefix "preprod"). ` +
        "Refusing to submit against the wrong network.",
    );
  }
  const network = process.env.CARDANO_NETWORK ?? "preprod";
  if (network !== "preprod") {
    throw new Error(
      `CARDANO_NETWORK="${network}" — this PoC only runs against preprod.`,
    );
  }
  const seedHex = process.env.CARDANO_PLATFORM_PRIVATE_KEY_HEX;
  if (!seedHex) {
    throw new Error("CARDANO_PLATFORM_PRIVATE_KEY_HEX is unset.");
  }
  const address = process.env.CARDANO_PLATFORM_ADDRESS;
  if (!address) {
    throw new Error("CARDANO_PLATFORM_ADDRESS is unset.");
  }
  return { projectId, seedHex, address };
}

function sumLovelace(utxos: BlockfrostUtxoResponse[]): bigint {
  let total = 0n;
  for (const u of utxos) {
    for (const a of u.amount) {
      if (a.unit === "lovelace") total += BigInt(a.quantity);
    }
  }
  return total;
}

function resolveAwaitTimeoutMs(): number {
  const raw = process.env.PREPROD_E2E_AWAIT_TIMEOUT_MS;
  if (!raw) return DEFAULT_AWAIT_TIMEOUT_MS;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_AWAIT_TIMEOUT_MS;
  return parsed;
}

async function main(): Promise<number> {
  process.stdout.write("Cardano preprod e2e submit (anchor-batch shape)\n\n");

  const results: StepResult<unknown>[] = [];

  // Step 1 — env (parsed once, threaded through subsequent steps via the step value)
  const envStep = await runStep<PreprodEnv>("env: preprod creds present", async () => {
    const env = requirePreprodEnv();
    return {
      value: env,
      detail: `BLOCKFROST_PROJECT_ID=preprod*** (${env.projectId.length} chars), CARDANO_PLATFORM_ADDRESS=${env.address}`,
    };
  });
  results.push(envStep);
  if (!envStep.ok) return 1;
  const { projectId, seedHex, address } = envStep.value;

  // Step 2 — derive + verify keypair
  const keyStep = await runStep("key: derived address matches env", async () => {
    const seed = parseFixedLengthHex(seedHex, 32, "CARDANO_PLATFORM_PRIVATE_KEY_HEX");
    const derived = deriveCardanoKeypair(seed, "preprod");
    if (derived.addressBech32 !== address) {
      throw new Error(
        `derived "${derived.addressBech32}" != CARDANO_PLATFORM_ADDRESS "${address}". ` +
          "Seed and address env don't pair — refusing to submit.",
      );
    }
    return {
      value: derived,
      detail: `payment key hash ${derived.paymentKeyHashHex}`,
    };
  });
  results.push(keyStep);
  if (!keyStep.ok) return 1;
  const kp = keyStep.value;

  // Step 3 — BlockfrostClient
  const client = new BlockfrostClient({ network: "CARDANO_PREPROD" });

  // Step 4 — protocol params + utxos + slot in parallel
  const fetchStep = await runStep<ChainSnapshot>(
    "blockfrost: fetch params + utxos + latest slot",
    async () => {
      const api = new BlockFrostAPI({ projectId, network: "preprod" });
      const [params, utxos, latest] = await Promise.all([
        client.getProtocolParams(),
        client.getUtxos(address),
        api.blocksLatest() as Promise<{ slot?: number | null }>,
      ]);
      const slot = latest?.slot;
      if (typeof slot !== "number") {
        throw new Error("blocksLatest returned no slot");
      }
      return {
        value: { params, utxos, currentSlot: slot },
        detail: `slot=${slot}, utxos=${utxos.length}, lovelace=${sumLovelace(utxos).toString()}`,
      };
    },
  );
  results.push(fetchStep);
  if (!fetchStep.ok) return 1;
  const { params, utxos, currentSlot } = fetchStep.value;
  if (utxos.length === 0) {
    process.stdout.write(
      `\nWallet ${address} has no UTXOs on preprod. Fund it via\n` +
        "  https://docs.cardano.org/cardano-testnets/tools/faucet/\n" +
        "and re-run.\n",
    );
    return 1;
  }

  // Step 5 — build + sign tx (single build; reuse the CBOR for submit)
  const aux = buildSampleAuxiliaryData({ prefix: "preprod-e2e", bidPrefix: "e2e" });
  const builtStep = await runStep<BuildAnchorTxOutput>(
    "txBuilder: build + sign anchor tx",
    async () => {
      const tx = buildAnchorTx({
        utxos,
        params: {
          min_fee_a: params.min_fee_a,
          min_fee_b: params.min_fee_b,
          pool_deposit: params.pool_deposit,
          key_deposit: params.key_deposit,
          max_val_size: params.max_val_size,
          max_tx_size: params.max_tx_size,
          coins_per_utxo_size: params.coins_per_utxo_size,
        },
        signKey: kp.cslPrivateKey,
        auxiliaryData: aux,
        changeAddressBech32: address,
        currentSlot,
      });
      return {
        value: tx,
        detail: `txHash=${tx.txHashHex}, size=${tx.txCborBytes.length}B`,
      };
    },
  );
  results.push(builtStep);
  if (!builtStep.ok) return 1;
  const tx = builtStep.value;

  // Step 6 — submit (uses the CBOR bytes signed above)
  const submitStep = await runStep<string>("blockfrost: submitTx", async () => {
    const hash = await client.submitTx(tx.txCborBytes);
    return { value: hash, detail: `submitted hash=${hash}` };
  });
  results.push(submitStep);
  if (!submitStep.ok) return 1;
  const submittedHash = submitStep.value;

  // Step 7 — await confirmation
  const awaitMs = resolveAwaitTimeoutMs();
  const confirmStep = await runStep(
    `blockfrost: awaitConfirmation (timeout=${awaitMs}ms)`,
    async () => {
      const confirmed = await client.awaitConfirmation(submittedHash, awaitMs);
      return {
        value: undefined,
        detail: `block_height=${confirmed.block_height ?? "null"}, block_time=${confirmed.block_time ?? "null"}`,
      };
    },
  );
  results.push(confirmStep);

  process.stdout.write(`\n${PREPROD_EXPLORER_TX}/${submittedHash}\n`);
  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    process.stdout.write(`\nFAIL: ${failed.length} step(s) failed.\n`);
    return 1;
  }
  process.stdout.write("\nALL STEPS PASSED.\n");
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err: unknown) => {
    process.stderr.write(`ERROR: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  });
