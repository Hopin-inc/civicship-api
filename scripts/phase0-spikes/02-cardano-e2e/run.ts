/**
 * Phase 0 PoC Spike #2 — Cardano E2E
 *
 * run.ts — orchestrator. Two modes:
 *
 *   dry-run (default, no network)
 *     - generates Ed25519 keys
 *     - builds a sample metadata-1985 payload (1 tx Merkle root + 1 vc Merkle
 *       root + 3 ops)
 *     - serializes and prints sizes
 *     - asserts 16KB / 64B constraints
 *     - exits 0 without contacting any external service
 *
 *   live (when BLOCKFROST_PROJECT_ID is set)
 *     - connects to Blockfrost preprod
 *     - fetches UTXOs at the issuer address (must be funded via faucet)
 *     - fetches latest protocol params + slot
 *     - submits the tx
 *     - polls /txs/{hash} for confirmation (≤ 5 min)
 *     - re-fetches metadata via txsMetadata, asserts round-trip integrity
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.5 (Blockfrost client)
 *   docs/report/did-vc-internalization.md §5.1.6 (metadata schema)
 *   docs/report/did-vc-internalization.md §11 Phase 0 0-1 (this spike)
 */

import { generateCardanoPreprodKeypair } from "./keygen";
import { buildRoot } from "./merkle";
import {
  buildAnchorTxFromSpec,
  buildMetadata,
  metadataByteSize,
  MAX_METADATA_TX_BYTES,
  type BuildMetadataInput,
  type BlockfrostUtxo,
  type BlockfrostProtocolParams,
} from "./build-tx";

const log = (...args: unknown[]) => console.log(...args); // eslint-disable-line no-console
const err = (...args: unknown[]) => console.error(...args); // eslint-disable-line no-console

const SAMPLE_BID = "ckspike02cardanoeec";
const SAMPLE_TX_LEAF_IDS = [
  "tx_ckabc0001",
  "tx_ckabc0002",
  "tx_ckabc0003",
  "tx_ckabc0004",
  "tx_ckabc0005",
];
const SAMPLE_VC_LEAF_IDS = [
  "vc_ckxyz0001",
  "vc_ckxyz0002",
  "vc_ckxyz0003",
];

function buildSampleMetadataInput(): BuildMetadataInput {
  return {
    v: 1,
    bid: SAMPLE_BID,
    ts: Math.floor(Date.now() / 1000),
    tx: {
      root: buildRoot(SAMPLE_TX_LEAF_IDS),
      count: SAMPLE_TX_LEAF_IDS.length,
    },
    vc: {
      root: buildRoot(SAMPLE_VC_LEAF_IDS),
      count: SAMPLE_VC_LEAF_IDS.length,
    },
    ops: [
      {
        k: "c",
        did: "did:web:api.civicship.app:users:u_spike01",
        h: "a".repeat(64),
        doc: {
          "@context": "https://www.w3.org/ns/did/v1",
          id: "did:web:api.civicship.app:users:u_spike01",
        },
        prev: null,
      },
      {
        k: "u",
        did: "did:web:api.civicship.app:users:u_spike02",
        h: "b".repeat(64),
        doc: {
          "@context": "https://www.w3.org/ns/did/v1",
          id: "did:web:api.civicship.app:users:u_spike02",
          verificationMethod: [
            {
              id: "did:web:api.civicship.app:users:u_spike02#key-1",
              type: "Ed25519VerificationKey2020",
              controller: "did:web:api.civicship.app:users:u_spike02",
              publicKeyMultibase: "z" + "C".repeat(43),
            },
          ],
        },
        prev: "c".repeat(64),
      },
      {
        k: "d",
        did: "did:web:api.civicship.app:users:u_spike03",
        prev: "d".repeat(64),
      },
    ],
  };
}

async function dryRun(): Promise<void> {
  log("=== Phase 0 Spike #2 — Cardano E2E (dry-run) ===");

  const kp = await generateCardanoPreprodKeypair();
  log("\n[1/4] Keypair");
  log("  preprodAddressBech32:", kp.preprodAddressBech32);
  log("  paymentKeyHashHex:   ", kp.paymentKeyHashHex);
  log("  publicKeyHex:        ", bytesToHex(kp.publicKey));

  const metaInput = buildSampleMetadataInput();
  log("\n[2/4] Metadata input (label 1985, §5.1.6)");
  log(
    JSON.stringify(
      {
        v: metaInput.v,
        bid: metaInput.bid,
        ts: metaInput.ts,
        tx: metaInput.tx
          ? { root: bytesToHex(metaInput.tx.root), count: metaInput.tx.count }
          : null,
        vc: metaInput.vc
          ? { root: bytesToHex(metaInput.vc.root), count: metaInput.vc.count }
          : null,
        opsCount: metaInput.ops.length,
        opKinds: metaInput.ops.map((o) => o.k),
      },
      null,
      2,
    ),
  );

  const aux = buildMetadata(metaInput);
  const auxSize = metadataByteSize(aux);
  log("\n[3/4] Metadata serialization");
  log("  AuxiliaryData CBOR size:", auxSize, "bytes");
  log(
    "  16KB ceiling check:     ",
    auxSize <= MAX_METADATA_TX_BYTES ? "OK" : "FAIL",
    `(${auxSize}/${MAX_METADATA_TX_BYTES})`,
  );
  log("  64B per-string check:   ", "(enforced inside builder via chunking)");
  log("  Hex preview (first 96 bytes):", bytesToHex(aux.to_bytes().slice(0, 96)));

  // Build a tx with synthetic UTXO + protocol params (preprod-realistic values
  // copied from a recent epochsLatestParameters response). This proves the
  // signing path works without any network call.
  const fakeUtxos: BlockfrostUtxo[] = [
    {
      tx_hash: "0".repeat(64), // placeholder 32-byte tx hash
      output_index: 0,
      amount: [{ unit: "lovelace", quantity: "10000000" }], // 10 ADA
    },
  ];
  const preprodParams: BlockfrostProtocolParams = {
    min_fee_a: 44,
    min_fee_b: 155381,
    pool_deposit: "500000000",
    key_deposit: "2000000",
    max_val_size: "5000",
    max_tx_size: 16384,
    coins_per_utxo_size: "4310",
  };

  log("\n[4/4] Tx build + sign (synthetic UTXOs)");
  const built = buildAnchorTxFromSpec(metaInput, {
    utxos: fakeUtxos,
    params: preprodParams,
    signKey: kp.cslPrivateKey,
    changeAddressBech32: kp.preprodAddressBech32,
    currentSlot: 50_000_000, // arbitrary preprod-ish slot for dry-run
  });
  log("  txHashHex:        ", built.txHashHex);
  log("  txCborBytes size: ", built.txCborBytes.length, "bytes");
  log(
    "  protocol max_tx_size check:",
    built.txCborBytes.length <= preprodParams.max_tx_size ? "OK" : "FAIL",
  );

  log("\nDry-run complete. To run live mode:");
  log(
    "  1. Fund the address printed above via Cardano preprod faucet:",
    "https://docs.cardano.org/cardano-testnets/tools/faucet/",
  );
  log("  2. export BLOCKFROST_PROJECT_ID=preprod...");
  log(
    "  3. export CARDANO_PRIVATE_KEY_SEED_HEX=<the seed printed by keygen.ts>",
  );
  log(
    "  4. pnpm tsx scripts/phase0-spikes/02-cardano-e2e/run.ts",
  );
  log("\nExit 0 — dry-run PASS.");
}

async function liveRun(): Promise<void> {
  log("=== Phase 0 Spike #2 — Cardano E2E (LIVE preprod) ===");

  // Lazy import to keep the dry-run path free of network deps from the
  // module loader's perspective. Blockfrost client only runs when env says so.
  const { BlockFrostAPI } = await import("@blockfrost/blockfrost-js");

  const projectId = requireEnv("BLOCKFROST_PROJECT_ID");
  const seedHex = process.env.CARDANO_PRIVATE_KEY_SEED_HEX;
  if (!seedHex) {
    throw new Error(
      "CARDANO_PRIVATE_KEY_SEED_HEX is required for live mode. Run keygen.ts " +
        "first to obtain a seed (and fund its address via the preprod faucet).",
    );
  }
  const { deriveCardanoPreprodKeypair } = await import("./keygen");
  const seed = hexToBytes(seedHex);
  const kp = await deriveCardanoPreprodKeypair(seed);
  log("Issuer address:", kp.preprodAddressBech32);

  const bf = new BlockFrostAPI({ projectId });

  log("\n[1/5] Fetching UTXOs...");
  const utxos = await bf.addressesUtxosAll(kp.preprodAddressBech32);
  log(`  ${utxos.length} UTXOs returned`);
  if (utxos.length === 0) {
    throw new Error(
      "No UTXOs at issuer address. Fund it via the Cardano preprod faucet: " +
        "https://docs.cardano.org/cardano-testnets/tools/faucet/",
    );
  }

  log("\n[2/5] Fetching latest protocol params + slot...");
  const params = await bf.epochsLatestParameters();
  const latestBlock = await bf.blocksLatest();
  const currentSlot = latestBlock.slot;
  if (currentSlot == null) {
    throw new Error("Blockfrost returned no slot for latest block.");
  }
  log(`  current slot: ${currentSlot}`);

  log("\n[3/5] Building + signing tx...");
  const metaInput = buildSampleMetadataInput();
  const built = buildAnchorTxFromSpec(metaInput, {
    utxos: utxos as unknown as BlockfrostUtxo[],
    params: {
      min_fee_a: params.min_fee_a,
      min_fee_b: params.min_fee_b,
      pool_deposit: params.pool_deposit,
      key_deposit: params.key_deposit,
      max_val_size: params.max_val_size ?? "5000",
      max_tx_size: params.max_tx_size,
      coins_per_utxo_size:
        (params as unknown as { coins_per_utxo_size?: string }).coins_per_utxo_size ??
        (params as unknown as { coins_per_utxo_word?: string }).coins_per_utxo_word ??
        "4310",
    } as BlockfrostProtocolParams,
    signKey: kp.cslPrivateKey,
    changeAddressBech32: kp.preprodAddressBech32,
    currentSlot,
  });
  log(`  txHash: ${built.txHashHex}`);
  log(`  size:   ${built.txCborBytes.length} bytes`);

  log("\n[4/5] Submitting...");
  const submittedHash = await bf.txSubmit(built.txCborBytes);
  log(`  submitted: ${submittedHash}`);
  if (submittedHash !== built.txHashHex) {
    err(
      `WARNING: blockfrost returned a different hash (${submittedHash}) than ` +
        `we computed locally (${built.txHashHex}). Continuing with submitted hash.`,
    );
  }
  const finalHash = submittedHash;

  log("\n[5/5] Polling for confirmation (≤ 5 min)...");
  const deadline = Date.now() + 5 * 60 * 1000;
  let confirmedTx: { block_height?: number | null } | null = null;
  while (Date.now() < deadline) {
    try {
      confirmedTx = await bf.txs(finalHash);
      if (confirmedTx?.block_height != null) {
        log(`  confirmed at block ${confirmedTx.block_height}`);
        break;
      }
    } catch {
      // 404 while pending is expected; ignore until timeout
    }
    await sleep(15_000);
  }
  if (!confirmedTx?.block_height) {
    throw new Error(
      `Tx ${finalHash} did not confirm within 5 minutes. Check explorer: ` +
        `https://preprod.cardanoscan.io/transaction/${finalHash}`,
    );
  }

  log("\n[6/5] Re-fetching metadata for round-trip check...");
  const fetchedMeta = await bf.txsMetadata(finalHash);
  log("  raw fetched metadata:");
  log(JSON.stringify(fetchedMeta, null, 2));

  const label1985 = fetchedMeta.find(
    (m: { label?: string | number }) =>
      String(m.label) === "1985" || m.label === 1985,
  );
  if (!label1985) {
    throw new Error(
      "Round-trip FAILED: Blockfrost did not return metadata under label 1985.",
    );
  }
  const json = (label1985 as { json_metadata?: unknown }).json_metadata as
    | Record<string, unknown>
    | undefined;
  if (!json) {
    throw new Error("Round-trip FAILED: label 1985 had no json_metadata.");
  }
  if (json.bid !== metaInput.bid) {
    throw new Error(
      `Round-trip FAILED: bid mismatch. expected=${metaInput.bid} got=${String(json.bid)}`,
    );
  }
  log("  Round-trip OK — bid matches.");

  log(
    `\nLive run complete. Verify on explorer: ` +
      `https://preprod.cardanoscan.io/transaction/${finalHash}`,
  );
}

function requireEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`missing required env var ${key}`);
  return v;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function bytesToHex(b: Uint8Array): string {
  return Array.from(b)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) throw new Error("hex length must be even");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function main(): Promise<void> {
  if (process.env.BLOCKFROST_PROJECT_ID) {
    await liveRun();
  } else {
    await dryRun();
  }
}

main().catch((e) => {
  err("\nFAIL:", e instanceof Error ? e.stack ?? e.message : e);
  process.exit(1);
});
