/**
 * Cardano metadata (label 1985) + tx builder for civicship anchoring.
 *
 * Pure functions only — NO network, NO signing key persistence, NO DB. The
 * caller is responsible for fetching UTXOs / protocol params / current slot
 * via the Blockfrost client (see §5.1.5) and supplying them in.
 *
 * Two public entry points:
 *   - `buildAuxiliaryData(input)` → CSL.AuxiliaryData with the §5.1.6 map
 *   - `buildAnchorTx(input)` → fully-signed CSL.Transaction + tx hash + CBOR
 *
 * Hash function:
 *   The metadata uses Blake2b-256 only (§5.1.7). NO keccak256 anywhere.
 *
 * 16 KB metadata ceiling:
 *   `MAX_METADATA_TX_BYTES` is a hard Cardano ceiling. Callers MUST respect
 *   it; we re-validate inside `buildAnchorTx` and throw a helpful error.
 *
 * Multi-byte UTF-8 chunking:
 *   Cardano `text` metadata items must be valid UTF-8 strings ≤ 64 bytes.
 *   A naïve fixed-byte split tears multi-byte characters at the boundary,
 *   producing malformed UTF-8 that the chain-side serializer rejects.
 *   We therefore split by character (`for (const char of s)`), accumulating
 *   bytes until the next char would push us past 64. See the matching
 *   regression test in `__tests__/.../cardano/txBuilder.test.ts`.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.6 (label 1985 schema, 64B/16KB)
 *   docs/report/did-vc-internalization.md §5.1.7 (Blake2b-256)
 *   docs/report/did-vc-internalization.md §3.4  (CSL + cbor-x)
 */

import * as CSL from "@emurgo/cardano-serialization-lib-nodejs";
import { encode as cborEncode } from "cbor-x";

/** Cardano metadata-1985 op shape (§5.1.6). */
export type DidOp =
  | {
      k: "c" | "u";
      did: string; // text; chunked when >64B (e.g. very long did:web)
      h: string; // doc_hash, 32B as 64 hex chars (no 0x prefix)
      doc: Record<string, unknown>; // CBOR-encoded + chunked
      prev?: string | null; // 64 hex chars or null/undefined
    }
  | {
      k: "d";
      did: string;
      prev: string; // 64 hex chars
    };

export interface BuildAuxiliaryDataInput {
  /** Schema version. Defaults to 1. */
  v?: number;
  /** Batch idempotency key (cuid, §5.3.1) — must be ≤ 64 bytes. */
  bid: string;
  /** Unix timestamp seconds. */
  ts: number;
  /** Transaction Merkle anchor block. Omit when txCount === 0 (design §5.1.6). */
  tx?: { root: Uint8Array; count: number };
  /** VC Merkle anchor block. Omit when vcCount === 0 (design §5.1.6). */
  vc?: { root: Uint8Array; count: number };
  /** DID operations (§5.1.6 ops list). */
  ops: DidOp[];
}

/** Cardano protocol limits referenced from §5.1.6. */
export const METADATA_LABEL_1985 = 1985;
export const MAX_METADATA_STRING_BYTES = 64;
export const MAX_METADATA_TX_BYTES = 16 * 1024;

// ---------------------------------------------------------------------------
// Low-level helpers
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

/**
 * Build a `text`-typed metadatum, chunking >64B inputs into a list of texts.
 *
 * Splits at character boundaries (NOT byte boundaries) so multi-byte
 * sequences are never torn — see the file header.
 */
function textAsChunkedList(s: string): CSL.TransactionMetadatum {
  const encoder = new TextEncoder();
  if (encoder.encode(s).length <= MAX_METADATA_STRING_BYTES) {
    return CSL.TransactionMetadatum.new_text(s);
  }
  const list = CSL.MetadataList.new();
  let currentChunk = "";
  let currentByteLength = 0;
  for (const char of s) {
    const charByteLength = encoder.encode(char).length;
    if (
      currentByteLength + charByteLength > MAX_METADATA_STRING_BYTES &&
      currentChunk !== ""
    ) {
      list.add(CSL.TransactionMetadatum.new_text(currentChunk));
      currentChunk = char;
      currentByteLength = charByteLength;
    } else {
      currentChunk += char;
      currentByteLength += charByteLength;
    }
  }
  if (currentChunk !== "") {
    list.add(CSL.TransactionMetadatum.new_text(currentChunk));
  }
  return CSL.TransactionMetadatum.new_list(list);
}

function bytesToHex(b: Uint8Array): string {
  let s = "";
  for (let i = 0; i < b.length; i++) {
    s += b[i].toString(16).padStart(2, "0");
  }
  return s;
}

/** 32-byte raw -> 64-char lowercase hex (no 0x prefix per §5.1.6). */
function hashHex32(b: Uint8Array): string {
  if (b.length !== 32) {
    throw new Error(`expected 32 bytes for root hash, got ${b.length}`);
  }
  return bytesToHex(b);
}

function buildOpMap(op: DidOp): CSL.TransactionMetadatum {
  const map = CSL.MetadataMap.new();
  map.insert_str("k", CSL.TransactionMetadatum.new_text(op.k));
  // did is a text. did:web URIs can exceed 64 bytes when userId is long.
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

  // doc — CBOR-encode then chunk to bytes-list (§5.1.6).
  const docBytes = cborEncode(op.doc);
  map.insert_str("doc", bytesAsChunkedList(docBytes));

  // prev
  if (op.prev !== undefined && op.prev !== null) {
    map.insert_str("prev", textAsChunkedList(op.prev));
  } else {
    // CSL has no native "null" metadatum; use empty string sentinel for
    // "no previous anchor" (i.e. CREATE on a fresh DID). The §5.1.6 example
    // shows JSON null, which has no canonical CBOR-metadata mapping.
    map.insert_str("prev", CSL.TransactionMetadatum.new_text(""));
  }

  return CSL.TransactionMetadatum.new_map(map);
}

function buildTopMap(input: BuildAuxiliaryDataInput): CSL.MetadataMap {
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
export function buildAuxiliaryData(
  input: BuildAuxiliaryDataInput,
): CSL.AuxiliaryData {
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
 *
 * Used in dry-run + tests to assert the 16KB ceiling per §5.1.6. This is the
 * AuxiliaryData CBOR size, which is what the 16KB limit applies to. The full
 * tx body (inputs/outputs/witness) adds a few hundred more bytes; that's
 * checked separately in `buildAnchorTx` against `params.max_tx_size`.
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
  /** UTXOs at the issuer address. */
  utxos: BlockfrostUtxo[];
  /** Protocol parameters from `epochsLatestParameters`. */
  params: BlockfrostProtocolParams;
  /** CSL PrivateKey (raw / non-extended, from keygen). */
  signKey: CSL.PrivateKey;
  /** AuxiliaryData built via buildAuxiliaryData. */
  auxiliaryData: CSL.AuxiliaryData;
  /** Issuer change address that owns the UTXOs (bech32). */
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
 * label 1985. We use the standard self-pay pattern: 1+ inputs, 1 change
 * output back to the issuer, fee auto-computed.
 *
 * Throws (with actionable error) if:
 *   - UTXO set is empty / has no usable lovelace UTXOs
 *   - metadata exceeds MAX_METADATA_TX_BYTES (16 KB)
 *   - tx body itself exceeds protocol max_tx_size
 *
 * We use `FixedTransaction.new_with_auxiliary` + `sign_and_add_vkey_signature`
 * (CSL v15+ API). The pre-v15 `hash_transaction(body)` helper was removed
 * because it had a known re-serialization-mismatch footgun between the bytes
 * we hashed and the bytes submitted on the wire.
 */
export function buildAnchorTx(
  input: BuildAnchorTxInput,
): BuildAnchorTxOutput {
  // 0. Validate metadata size BEFORE doing anything expensive.
  const metaSize = metadataByteSize(input.auxiliaryData);
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

  // 1. TransactionBuilderConfig from protocol params.
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

  // 2. UTXO を input として追加（CIP-2 LargestFirst で選ばせる）
  // 重要: マルチアセット UTXO の native token を Value に含めないと
  // ValueNotConservedUTxO エラーで tx 構築失敗、または token 消失（burn）の可能性。
  // Blockfrost の amount 配列は `[{ unit: "lovelace" | "<policy_hex 56><name_hex>", quantity: "..." }]`
  // 形式なので全エントリを走査して Value/MultiAsset を完全構築する（Gemini レビュー指摘）。
  const issuerAddr = CSL.Address.from_bech32(input.changeAddressBech32);
  const utxoSet = CSL.TransactionUnspentOutputs.new();
  for (const u of input.utxos) {
    const lovelace = u.amount.find((a) => a.unit === "lovelace");
    // lovelace は CSL.Value 必須。0 以上（min-utxo 制約は CSL builder 側に任せる）
    const lovelaceQty = lovelace ? lovelace.quantity : "0";
    const value = CSL.Value.new(CSL.BigNum.from_str(lovelaceQty));

    // 非 lovelace エントリを policy_id ごとにグルーピングして MultiAsset 構築
    const nonLovelace = u.amount.filter((a) => a.unit !== "lovelace");
    if (nonLovelace.length > 0) {
      const ma = CSL.MultiAsset.new();
      for (const asset of nonLovelace) {
        // unit 形式: <policy_id (28 bytes / 56 hex chars)><asset_name (任意長 hex)>
        if (asset.unit.length < 56) {
          throw new Error(
            `buildAnchorTx: invalid asset unit '${asset.unit}' (length < 56, expected policy_id + asset_name hex)`,
          );
        }
        const policyHex = asset.unit.slice(0, 56);
        const nameHex = asset.unit.slice(56);
        const policyId = CSL.ScriptHash.from_hex(policyHex);
        const assetName = CSL.AssetName.new(
          Uint8Array.from(Buffer.from(nameHex, "hex")),
        );
        // 同じ policy_id に複数 asset がある場合は既存 Assets に追加
        const existing = ma.get(policyId);
        const assets = existing ?? CSL.Assets.new();
        assets.insert(assetName, CSL.BigNum.from_str(asset.quantity));
        ma.insert(policyId, assets);
      }
      value.set_multiasset(ma);
    }

    const txInput = CSL.TransactionInput.new(
      CSL.TransactionHash.from_hex(u.tx_hash),
      u.output_index,
    );
    const txOut = CSL.TransactionOutput.new(issuerAddr, value);
    utxoSet.add(CSL.TransactionUnspentOutput.new(txInput, txOut));
  }
  if (utxoSet.len() === 0) {
    throw new Error("buildAnchorTx: no UTXOs supplied.");
  }
  // add_inputs_from に渡せば multiasset を含めてプランナーが change を計算する。
  // change output に余剰 native token を載せて burn を防ぐ（add_change_if_needed が処理）。
  txb.add_inputs_from(utxoSet, CSL.CoinSelectionStrategyCIP2.LargestFirst);

  // 3. Attach metadata.
  txb.set_auxiliary_data(input.auxiliaryData);

  // 4. TTL — required for preprod / mainnet tx to be acceptable.
  const ttlOffset = input.ttlOffset ?? 7200;
  txb.set_ttl_bignum(
    CSL.BigNum.from_str(String(input.currentSlot + ttlOffset)),
  );

  // 5. Self-pay change.
  txb.add_change_if_needed(issuerAddr);

  // 6. Build the unsigned tx, then use FixedTransaction to sign deterministically.
  const unsignedTx = txb.build_tx();
  const fixed = CSL.FixedTransaction.new_with_auxiliary(
    unsignedTx.body().to_bytes(),
    CSL.TransactionWitnessSet.new().to_bytes(),
    input.auxiliaryData.to_bytes(),
    true,
  );
  fixed.sign_and_add_vkey_signature(input.signKey);
  const txHash = fixed.transaction_hash();
  const txCborBytes = fixed.to_bytes();
  const tx = CSL.Transaction.from_bytes(txCborBytes);

  // 7. Final tx-size guard against protocol max_tx_size.
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
