/**
 * Phase 0 PoC Spike #2 — Cardano E2E
 *
 * build-tx.ts
 *
 * Pure tx-builder for Cardano metadata label 1985. NO network calls.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.6 — full label-1985 schema,
 *     the 64-byte string limit, and the CBOR-chunked `doc` field.
 *   docs/report/did-vc-internalization.md §5.1.7 — Blake2b-256 (NOT keccak)
 *     hashing for leaves and Merkle internal nodes.
 *   docs/report/did-vc-internalization.md §3.4 — CSL + cbor-x.
 *
 * Two public entry points:
 *   - buildMetadata(input)    → CSL.AuxiliaryData with the full §5.1.6 map
 *   - buildAnchorTx(input)    → fully-signed CSL.Transaction
 *
 * Export `MAX_METADATA_TX_BYTES = 16384` is a hard ceiling that callers MUST
 * respect; we re-validate inside buildAnchorTx and throw a helpful error.
 */

import * as CSL from "@emurgo/cardano-serialization-lib-nodejs";
import { encode as cborEncode } from "cbor-x";

/** Cardano metadata-1985 op shape (§5.1.6). */
export type DidOp =
  | {
      k: "c" | "u";
      did: string; // < 64 bytes per §5.1.6 string-element rule
      h: string; // doc_hash, 32B as 64 hex chars (no 0x prefix)
      doc: Record<string, unknown>; // arbitrary JSON-able DID Document; will be CBOR-encoded + chunked
      prev?: string | null; // 64 hex chars or null/undefined
    }
  | {
      k: "d";
      did: string;
      prev: string; // 64 hex chars
    };

export interface BuildMetadataInput {
  /** Batch idempotency key (cuid, §5.3.1) — must be ≤ 64 bytes. */
  bid: string;
  /** Unix timestamp seconds. */
  ts: number;
  /** Transaction-Merkle-anchor block. Omit when `txCount === 0`. */
  tx?: { root: Uint8Array; count: number };
  /** VC-Merkle-anchor block. Omit when `vcCount === 0` (design §5.1.6). */
  vc?: { root: Uint8Array; count: number };
  /** DID operations (§5.1.6). */
  ops: DidOp[];
  /** Schema version. Defaults to 1. */
  v?: number;
}

/** Cardano protocol limits referenced from §5.1.6. */
export const METADATA_LABEL_1985 = 1985;
export const MAX_METADATA_STRING_BYTES = 64;
export const MAX_METADATA_TX_BYTES = 16 * 1024;

// ---------------------------------------------------------------------------
// Low-level helpers (§5.1.6 §3.4)
// ---------------------------------------------------------------------------

/** Build a `bytes`-typed metadatum, chunking >64B inputs into a list of bytes. */
function bytesAsChunkedList(b: Uint8Array): CSL.TransactionMetadatum {
  if (b.length <= MAX_METADATA_STRING_BYTES) {
    return CSL.TransactionMetadatum.new_bytes(b);
  }
  const list = CSL.MetadataList.new();
  for (let i = 0; i < b.length; i += MAX_METADATA_STRING_BYTES) {
    list.add(
      CSL.TransactionMetadatum.new_bytes(
        b.subarray(i, Math.min(i + MAX_METADATA_STRING_BYTES, b.length)),
      ),
    );
  }
  return CSL.TransactionMetadatum.new_list(list);
}

/** Build a `text`-typed metadatum, chunking >64B inputs into a list of texts. */
function textAsChunkedList(s: string): CSL.TransactionMetadatum {
  const utf8 = new TextEncoder().encode(s);
  if (utf8.length <= MAX_METADATA_STRING_BYTES) {
    return CSL.TransactionMetadatum.new_text(s);
  }
  const list = CSL.MetadataList.new();
  for (let i = 0; i < utf8.length; i += MAX_METADATA_STRING_BYTES) {
    const slice = utf8.subarray(
      i,
      Math.min(i + MAX_METADATA_STRING_BYTES, utf8.length),
    );
    list.add(CSL.TransactionMetadatum.new_text(new TextDecoder().decode(slice)));
  }
  return CSL.TransactionMetadatum.new_list(list);
}

/** 32-byte raw -> 64-char lowercase hex (no 0x prefix per §5.1.6). */
function hashHex32(b: Uint8Array): string {
  if (b.length !== 32) {
    throw new Error(`expected 32 bytes for root hash, got ${b.length}`);
  }
  return Array.from(b)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

function buildOpMap(op: DidOp): CSL.TransactionMetadatum {
  const map = CSL.MetadataMap.new();
  // k
  map.insert_str("k", CSL.TransactionMetadatum.new_text(op.k));
  // did (text, may need chunking — long did:web URIs can exceed 64 bytes)
  map.insert_str("did", textAsChunkedList(op.did));

  if (op.k === "d") {
    map.insert_str("prev", textAsChunkedList(op.prev));
    return CSL.TransactionMetadatum.new_map(map);
  }

  // c / u
  if (op.h.length !== 64) {
    throw new Error(
      `op.h must be 64 hex chars (32B Blake2b-256), got length ${op.h.length}`,
    );
  }
  map.insert_str("h", CSL.TransactionMetadatum.new_text(op.h));

  // doc — CBOR-encode the JSON-able document, then chunk to bytes-list (§5.1.6)
  const docBytes = cborEncode(op.doc);
  map.insert_str("doc", bytesAsChunkedList(docBytes));

  // prev
  if (op.prev !== undefined && op.prev !== null) {
    map.insert_str("prev", textAsChunkedList(op.prev));
  } else {
    // Explicit null per the design example. CSL has no native "null" metadatum;
    // we use empty string as a sentinel. The §5.1.6 example uses JSON null,
    // which doesn't have a CBOR-metadata mapping; design ADR pending. For the
    // spike we record the choice here and assert it in tests.
    map.insert_str("prev", CSL.TransactionMetadatum.new_text(""));
  }

  return CSL.TransactionMetadatum.new_map(map);
}

function buildTopMap(input: BuildMetadataInput): CSL.MetadataMap {
  const m = CSL.MetadataMap.new();

  m.insert_str(
    "v",
    CSL.TransactionMetadatum.new_int(CSL.Int.new_i32(input.v ?? 1)),
  );
  m.insert_str("bid", textAsChunkedList(input.bid));
  m.insert_str(
    "ts",
    CSL.TransactionMetadatum.new_int(
      CSL.Int.new(CSL.BigNum.from_str(String(input.ts))),
    ),
  );

  if (input.tx) {
    const txMap = CSL.MetadataMap.new();
    txMap.insert_str(
      "root",
      CSL.TransactionMetadatum.new_text(hashHex32(input.tx.root)),
    );
    txMap.insert_str(
      "count",
      CSL.TransactionMetadatum.new_int(
        CSL.Int.new(CSL.BigNum.from_str(String(input.tx.count))),
      ),
    );
    m.insert_str("tx", CSL.TransactionMetadatum.new_map(txMap));
  }

  if (input.vc) {
    const vcMap = CSL.MetadataMap.new();
    vcMap.insert_str(
      "root",
      CSL.TransactionMetadatum.new_text(hashHex32(input.vc.root)),
    );
    vcMap.insert_str(
      "count",
      CSL.TransactionMetadatum.new_int(
        CSL.Int.new(CSL.BigNum.from_str(String(input.vc.count))),
      ),
    );
    m.insert_str("vc", CSL.TransactionMetadatum.new_map(vcMap));
  }

  // ops list
  const opsList = CSL.MetadataList.new();
  for (const op of input.ops) {
    opsList.add(buildOpMap(op));
  }
  m.insert_str("ops", CSL.TransactionMetadatum.new_list(opsList));

  return m;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a CSL.AuxiliaryData containing the §5.1.6 metadata under label 1985.
 * Pure function — no network, no signing, no UTXOs.
 */
export function buildMetadata(input: BuildMetadataInput): CSL.AuxiliaryData {
  const general = CSL.GeneralTransactionMetadata.new();
  general.insert(
    CSL.BigNum.from_str(String(METADATA_LABEL_1985)),
    CSL.TransactionMetadatum.new_map(buildTopMap(input)),
  );
  const aux = CSL.AuxiliaryData.new();
  aux.set_metadata(general);
  return aux;
}

/**
 * Estimate metadata serialized size (independent of fee/UTXO).
 * Used in dry-run + tests to assert the 16KB ceiling per §5.1.6.
 *
 * NOTE: this is the AuxiliaryData CBOR size, which is what the 16KB limit
 * actually applies to. The full tx body (inputs/outputs/witness) adds a few
 * hundred extra bytes; that's checked separately in buildAnchorTx.
 */
export function metadataByteSize(aux: CSL.AuxiliaryData): number {
  return aux.to_bytes().length;
}

/** Blockfrost UTXO shape (subset, what we need from `addressesUtxosAll`). */
export interface BlockfrostUtxo {
  tx_hash: string;
  output_index: number;
  amount: { unit: string; quantity: string }[]; // unit "lovelace" or asset id
}

/** Blockfrost protocol-params subset (matches `epochsLatestParameters`). */
export interface BlockfrostProtocolParams {
  min_fee_a: number;
  min_fee_b: number;
  pool_deposit: string;
  key_deposit: string;
  max_val_size: string;
  max_tx_size: number;
  coins_per_utxo_size: string;
}

export interface BuildAnchorTxInput {
  /** UTXOs at the issuer address (typed loosely so live + tests both fit). */
  utxos: BlockfrostUtxo[];
  /** Protocol parameters from `epochsLatestParameters`. */
  params: BlockfrostProtocolParams;
  /** CSL PrivateKey (raw / non-extended, from keygen.ts). */
  signKey: CSL.PrivateKey;
  /** AuxiliaryData built via buildMetadata. */
  metadata: CSL.AuxiliaryData;
  /** Issuer address that owns the UTXOs (bech32). */
  changeAddressBech32: string;
  /** Current Cardano slot — used for ttl. Caller fetches via /blocks/latest. */
  currentSlot: number;
  /** TTL = currentSlot + ttlOffset; default 7200 slots (~2h). */
  ttlOffset?: number;
}

export interface BuildAnchorTxOutput {
  /** Fully-signed transaction. */
  tx: CSL.Transaction;
  /** Tx body hash (32B) — what the explorer displays as tx ID. */
  txHashHex: string;
  /** Final tx CBOR (what gets sent to `txSubmit`). */
  txCborBytes: Uint8Array;
}

/**
 * Build + sign a Cardano transaction whose only purpose is anchoring metadata
 * label 1985. We use the standard self-pay pattern: 1 input, 1 change output
 * back to the issuer address, fee auto-computed.
 *
 * Throws (with actionable error) if:
 *   - UTXO set is empty
 *   - metadata exceeds MAX_METADATA_TX_BYTES (16KB)
 *   - tx body itself exceeds protocol max_tx_size
 */
export function buildAnchorTx(
  input: BuildAnchorTxInput,
): BuildAnchorTxOutput {
  // 0. Validate metadata size BEFORE doing anything expensive
  const metaSize = metadataByteSize(input.metadata);
  if (metaSize > MAX_METADATA_TX_BYTES) {
    throw new Error(
      `metadata is ${metaSize} bytes, exceeding the Cardano 16KB metadata ceiling ` +
        `(${MAX_METADATA_TX_BYTES}). Reduce ops[] count or split across multiple txs ` +
        `(see design §5.1.6 「超過時は分割 tx」).`,
    );
  }
  if (input.utxos.length === 0) {
    throw new Error(
      "buildAnchorTx: no UTXOs at the issuer address. Fund the address via " +
        "the Cardano preprod faucet first: " +
        "https://docs.cardano.org/cardano-testnets/tools/faucet/",
    );
  }

  // 1. TransactionBuilderConfig from protocol params
  const linearFee = CSL.LinearFee.new(
    CSL.BigNum.from_str(String(input.params.min_fee_a)),
    CSL.BigNum.from_str(String(input.params.min_fee_b)),
  );
  const cfg = CSL.TransactionBuilderConfigBuilder.new()
    .fee_algo(linearFee)
    .pool_deposit(CSL.BigNum.from_str(input.params.pool_deposit))
    .key_deposit(CSL.BigNum.from_str(input.params.key_deposit))
    .max_value_size(parseInt(input.params.max_val_size, 10))
    .max_tx_size(input.params.max_tx_size)
    .coins_per_utxo_byte(CSL.BigNum.from_str(input.params.coins_per_utxo_size))
    .prefer_pure_change(true)
    .build();

  const txb = CSL.TransactionBuilder.new(cfg);

  // 2. Add UTXOs as inputs (we'll add all and let CIP-2 LargestFirst pick)
  const issuerAddr = CSL.Address.from_bech32(input.changeAddressBech32);
  const utxoSet = CSL.TransactionUnspentOutputs.new();
  for (const u of input.utxos) {
    const lovelace = u.amount.find((a) => a.unit === "lovelace");
    if (!lovelace) continue; // skip multi-asset-only utxos in this spike
    const txInput = CSL.TransactionInput.new(
      CSL.TransactionHash.from_hex(u.tx_hash),
      u.output_index,
    );
    const value = CSL.Value.new(CSL.BigNum.from_str(lovelace.quantity));
    const txOut = CSL.TransactionOutput.new(issuerAddr, value);
    utxoSet.add(CSL.TransactionUnspentOutput.new(txInput, txOut));
  }
  if (utxoSet.len() === 0) {
    throw new Error(
      "buildAnchorTx: no usable lovelace UTXOs (all skipped as multi-asset-only).",
    );
  }
  txb.add_inputs_from(utxoSet, CSL.CoinSelectionStrategyCIP2.LargestFirst);

  // 3. Attach metadata
  txb.set_auxiliary_data(input.metadata);

  // 4. TTL — required for preprod tx to be acceptable
  const ttlOffset = input.ttlOffset ?? 7200;
  txb.set_ttl_bignum(
    CSL.BigNum.from_str(String(input.currentSlot + ttlOffset)),
  );

  // 5. Self-pay change
  txb.add_change_if_needed(issuerAddr);

  // 6. Build the unsigned tx, then use FixedTransaction to sign deterministically.
  //
  //    CSL v15+ removed the top-level `hash_transaction(body)` helper. The
  //    recommended path is now: assemble the raw bytes via TransactionBuilder,
  //    wrap them in FixedTransaction, and let FixedTransaction handle hashing
  //    and witness assembly. This avoids a re-serialization mismatch between
  //    the bytes we hash and the bytes we submit (the previous CSL API had a
  //    known footgun there — see the v15 release notes).
  const unsignedTx = txb.build_tx(); // empty witness_set, includes aux data
  const fixed = CSL.FixedTransaction.new_with_auxiliary(
    unsignedTx.body().to_bytes(),
    CSL.TransactionWitnessSet.new().to_bytes(),
    input.metadata.to_bytes(),
    true,
  );
  fixed.sign_and_add_vkey_signature(input.signKey);
  const txHash = fixed.transaction_hash();
  const txCborBytes = fixed.to_bytes();
  const tx = CSL.Transaction.from_bytes(txCborBytes);

  // 7. Final tx-size guard against protocol max_tx_size
  if (txCborBytes.length > input.params.max_tx_size) {
    throw new Error(
      `tx is ${txCborBytes.length} bytes, exceeding protocol max_tx_size ` +
        `${input.params.max_tx_size}. Reduce metadata or split across multiple txs.`,
    );
  }

  return {
    tx,
    txHashHex: bytesToHex(txHash.to_bytes()),
    txCborBytes,
  };
}

/**
 * Same as buildAnchorTx but accepts a fully-spec'd metadata input rather than
 * an already-built CSL.AuxiliaryData. Convenience for the run.ts flow.
 */
export function buildAnchorTxFromSpec(
  metaInput: BuildMetadataInput,
  rest: Omit<BuildAnchorTxInput, "metadata">,
): BuildAnchorTxOutput {
  return buildAnchorTx({ ...rest, metadata: buildMetadata(metaInput) });
}

function bytesToHex(b: Uint8Array): string {
  return Array.from(b)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
