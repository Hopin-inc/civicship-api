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

import { blake2b } from "@noble/hashes/blake2b";

import {
  BlockfrostClient,
  type BlockfrostUtxoResponse,
} from "../src/infrastructure/libs/blockfrost/client.ts";
import { deriveCardanoKeypair } from "../src/infrastructure/libs/cardano/keygen.ts";
import {
  buildAnchorTx,
  type BuildAnchorTxOutput,
  buildAuxiliaryData,
  type DidOp,
} from "../src/infrastructure/libs/cardano/txBuilder.ts";

const DEFAULT_AWAIT_TIMEOUT_MS = 6 * 60 * 1000;
const PREPROD_EXPLORER_TX = "https://preprod.cardanoscan.io/transaction";

type StepResult = { name: string; ok: boolean; detail: string };

async function runStep(
  name: string,
  fn: () => Promise<string>,
): Promise<StepResult> {
  process.stdout.write(`-> ${name} ...\n`);
  try {
    const detail = await fn();
    process.stdout.write(`   PASS: ${detail}\n`);
    return { name, ok: true, detail };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    process.stdout.write(`   FAIL: ${msg}\n`);
    return { name, ok: false, detail: msg };
  }
}

function requirePreprodEnv(): {
  projectId: string;
  seedHex: string;
  address: string;
} {
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

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length !== 64) {
    throw new Error(
      `CARDANO_PLATFORM_PRIVATE_KEY_HEX must be 64 hex chars (32 bytes), got ${clean.length}`,
    );
  }
  if (!/^[0-9a-fA-F]+$/.test(clean)) {
    throw new Error("CARDANO_PLATFORM_PRIVATE_KEY_HEX contains non-hex characters");
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function bytesToHex(b: Uint8Array): string {
  let s = "";
  for (const byte of b) s += byte.toString(16).padStart(2, "0");
  return s;
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

function buildSampleAuxiliaryData() {
  const sampleRoot = blake2b(new TextEncoder().encode("preprod-e2e-tx"), { dkLen: 32 });
  const sampleVcRoot = blake2b(new TextEncoder().encode("preprod-e2e-vc"), { dkLen: 32 });
  const sampleDocHash = blake2b(new TextEncoder().encode("preprod-e2e-doc"), { dkLen: 32 });

  const ops: DidOp[] = [
    {
      k: "c",
      did: "did:web:api.civicship.app:users:preprod-e2e",
      h: bytesToHex(sampleDocHash),
      doc: {
        "@context": ["https://www.w3.org/ns/did/v1"],
        id: "did:web:api.civicship.app:users:preprod-e2e",
      },
      prev: null,
    },
  ];

  return buildAuxiliaryData({
    v: 1,
    bid: `e2e_${Date.now().toString(36)}`,
    ts: Math.floor(Date.now() / 1000),
    tx: { root: sampleRoot, count: 1 },
    vc: { root: sampleVcRoot, count: 1 },
    ops,
  });
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

  const results: StepResult[] = [];

  // Step 1 — env
  const envStep = await runStep("env: preprod creds present", async () => {
    const { projectId, address } = requirePreprodEnv();
    return `BLOCKFROST_PROJECT_ID=preprod*** (${projectId.length} chars), CARDANO_PLATFORM_ADDRESS=${address}`;
  });
  results.push(envStep);
  if (!envStep.ok) return 1;

  const { projectId, seedHex, address } = requirePreprodEnv();

  // Step 2 — derive + verify keypair
  const seed = hexToBytes(seedHex);
  const kp = deriveCardanoKeypair(seed, "preprod");
  const keyStep = await runStep("key: derived address matches env", async () => {
    if (kp.addressBech32 !== address) {
      throw new Error(
        `derived "${kp.addressBech32}" != CARDANO_PLATFORM_ADDRESS "${address}". ` +
          "Seed and address env don't pair — refusing to submit.",
      );
    }
    return `payment key hash ${kp.paymentKeyHashHex}`;
  });
  results.push(keyStep);
  if (!keyStep.ok) return 1;

  // Step 3 — BlockfrostClient
  const client = new BlockfrostClient({ network: "CARDANO_PREPROD" });

  // Step 4 — protocol params + utxos + slot in parallel
  let params: Awaited<ReturnType<BlockfrostClient["getProtocolParams"]>>;
  let utxos: BlockfrostUtxoResponse[];
  let currentSlot: number;
  const fetchStep = await runStep("blockfrost: fetch params + utxos + latest slot", async () => {
    const { BlockFrostAPI } = await import("@blockfrost/blockfrost-js");
    const api = new BlockFrostAPI({ projectId, network: "preprod" });
    const [p, u, latest] = await Promise.all([
      client.getProtocolParams(),
      client.getUtxos(address),
      api.blocksLatest() as Promise<{ slot?: number | null }>,
    ]);
    params = p;
    utxos = u;
    const slot = latest?.slot;
    if (typeof slot !== "number") {
      throw new Error("blocksLatest returned no slot");
    }
    currentSlot = slot;
    return `slot=${currentSlot}, utxos=${utxos.length}, lovelace=${sumLovelace(utxos).toString()}`;
  });
  results.push(fetchStep);
  if (!fetchStep.ok) return 1;
  if (utxos!.length === 0) {
    process.stdout.write(
      `\nWallet ${address} has no UTXOs on preprod. Fund it via\n` +
        "  https://docs.cardano.org/cardano-testnets/tools/faucet/\n" +
        "and re-run.\n",
    );
    return 1;
  }

  // Step 5 — build + sign tx (single build; reuse the CBOR for submit)
  const aux = buildSampleAuxiliaryData();
  let tx: BuildAnchorTxOutput | undefined;
  const built = await runStep("txBuilder: build + sign anchor tx", async () => {
    tx = buildAnchorTx({
      utxos: utxos!,
      params: {
        min_fee_a: params!.min_fee_a,
        min_fee_b: params!.min_fee_b,
        pool_deposit: params!.pool_deposit,
        key_deposit: params!.key_deposit,
        max_val_size: params!.max_val_size,
        max_tx_size: params!.max_tx_size,
        coins_per_utxo_size: params!.coins_per_utxo_size,
      },
      signKey: kp.cslPrivateKey,
      auxiliaryData: aux,
      changeAddressBech32: address,
      currentSlot: currentSlot!,
    });
    return `txHash=${tx.txHashHex}, size=${tx.txCborBytes.length}B`;
  });
  results.push(built);
  if (!built.ok || !tx) return 1;

  // Step 6 — submit (uses the CBOR bytes signed above)
  let submittedHash = "";
  const submitStep = await runStep("blockfrost: submitTx", async () => {
    submittedHash = await client.submitTx(tx!.txCborBytes);
    return `submitted hash=${submittedHash}`;
  });
  results.push(submitStep);
  if (!submitStep.ok) return 1;

  // Step 7 — await confirmation
  const awaitMs = resolveAwaitTimeoutMs();
  const confirmStep = await runStep(
    `blockfrost: awaitConfirmation (timeout=${awaitMs}ms)`,
    async () => {
      const confirmed = await client.awaitConfirmation(submittedHash, awaitMs);
      return `block_height=${confirmed.block_height ?? "null"}, block_time=${confirmed.block_time ?? "null"}`;
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
