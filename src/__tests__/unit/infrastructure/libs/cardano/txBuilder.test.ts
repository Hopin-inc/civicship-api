/**
 * Unit tests for `src/infrastructure/libs/cardano/txBuilder.ts`.
 *
 * No network calls. Exercises:
 *   - §5.1.6 metadata structure (top-level keys, vc-omission, ops list)
 *   - 64-byte chunking for >64B values, including UTF-8 multibyte
 *   - 16 KB metadata ceiling enforced with a helpful error
 *   - sign + serialize round-trip via FixedTransaction
 *   - empty UTXO rejection
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.6
 */

import * as CSL from "@emurgo/cardano-serialization-lib-nodejs";
import {
  buildAuxiliaryData,
  buildAnchorTx,
  metadataByteSize,
  MAX_METADATA_TX_BYTES,
  type BuildAuxiliaryDataInput,
  type DidOp,
  type BlockfrostUtxo,
  type BlockfrostProtocolParams,
} from "@/infrastructure/libs/cardano/txBuilder";
import { deriveCardanoKeypair } from "@/infrastructure/libs/cardano/keygen";

const PREPROD_PARAMS: BlockfrostProtocolParams = {
  min_fee_a: 44,
  min_fee_b: 155381,
  pool_deposit: "500000000",
  key_deposit: "2000000",
  max_val_size: "5000",
  max_tx_size: 16384,
  coins_per_utxo_size: "4310",
};

const FAKE_UTXOS: BlockfrostUtxo[] = [
  {
    tx_hash: "0".repeat(64),
    output_index: 0,
    amount: [{ unit: "lovelace", quantity: "10000000" }],
  },
];

function makeMinimalInput(
  overrides: Partial<BuildAuxiliaryDataInput> = {},
): BuildAuxiliaryDataInput {
  return {
    v: 1,
    bid: "ckspike",
    ts: 1746336034,
    tx: { root: new Uint8Array(32).fill(0xab), count: 5 },
    vc: { root: new Uint8Array(32).fill(0xcd), count: 7 },
    ops: [
      {
        k: "c",
        did: "did:web:api.civicship.app:users:u_min",
        h: "a".repeat(64),
        doc: { id: "did:web:api.civicship.app:users:u_min" },
        prev: null,
      },
    ],
    ...overrides,
  };
}

describe("buildAuxiliaryData — §5.1.6 structure", () => {
  it("includes all top-level keys (v, bid, ts, tx, vc, ops)", () => {
    const aux = buildAuxiliaryData(makeMinimalInput());
    const general = aux.metadata();
    expect(general).toBeDefined();

    const top = general!.get(CSL.BigNum.from_str("1985"));
    expect(top).toBeDefined();
    const map = top!.as_map();

    expect(() => map.get_str("v")).not.toThrow();
    expect(() => map.get_str("bid")).not.toThrow();
    expect(() => map.get_str("ts")).not.toThrow();
    expect(() => map.get_str("tx")).not.toThrow();
    expect(() => map.get_str("vc")).not.toThrow();
    expect(() => map.get_str("ops")).not.toThrow();
  });

  it("omits the vc block when not provided (§5.1.6 'count=0 は省略可')", () => {
    const aux = buildAuxiliaryData(makeMinimalInput({ vc: undefined }));
    const top = aux.metadata()!.get(CSL.BigNum.from_str("1985"))!.as_map();
    expect(() => top.get_str("vc")).toThrow();
    expect(() => top.get_str("tx")).not.toThrow();
  });

  it("omits the tx block when not provided", () => {
    const aux = buildAuxiliaryData(makeMinimalInput({ tx: undefined }));
    const top = aux.metadata()!.get(CSL.BigNum.from_str("1985"))!.as_map();
    expect(() => top.get_str("tx")).toThrow();
    expect(() => top.get_str("vc")).not.toThrow();
  });

  it("encodes the ops list with the right length and per-op shape", () => {
    const ops: DidOp[] = [
      {
        k: "c",
        did: "did:web:a:b:c",
        h: "a".repeat(64),
        doc: { id: "x" },
        prev: null,
      },
      {
        k: "u",
        did: "did:web:a:b:c",
        h: "b".repeat(64),
        doc: { id: "x" },
        prev: "f".repeat(64),
      },
      { k: "d", did: "did:web:a:b:c", prev: "f".repeat(64) },
    ];
    const aux = buildAuxiliaryData(makeMinimalInput({ ops }));
    const top = aux.metadata()!.get(CSL.BigNum.from_str("1985"))!.as_map();
    const opsList = top.get_str("ops").as_list();
    expect(opsList.len()).toBe(3);

    // d-op should NOT have h or doc
    const dOp = opsList.get(2).as_map();
    expect(() => dOp.get_str("h")).toThrow();
    expect(() => dOp.get_str("doc")).toThrow();
    expect(() => dOp.get_str("prev")).not.toThrow();
  });

  it("rejects ops with non-32B doc_hash with an actionable error", () => {
    const op: DidOp = {
      k: "c",
      did: "did:web:a:b:c",
      h: "abc",
      doc: { id: "x" },
      prev: null,
    };
    expect(() => buildAuxiliaryData(makeMinimalInput({ ops: [op] }))).toThrow(
      /must be 64 hex chars/,
    );
  });
});

describe("buildAuxiliaryData — 64-byte chunking", () => {
  it("chunks a long DID Document into a list of <=64B byte segments", () => {
    const bigDoc: Record<string, unknown> = {
      id: "did:web:api.civicship.app:users:u_big",
      service: Array.from({ length: 30 }, (_, i) => ({
        id: `#svc-${i}`,
        type: "ExampleService",
        serviceEndpoint: `https://example.com/svc/${i}/${"x".repeat(40)}`,
      })),
    };
    const op: DidOp = {
      k: "c",
      did: "did:web:api.civicship.app:users:u_big",
      h: "a".repeat(64),
      doc: bigDoc,
      prev: null,
    };
    const aux = buildAuxiliaryData(makeMinimalInput({ ops: [op] }));
    const top = aux.metadata()!.get(CSL.BigNum.from_str("1985"))!.as_map();
    const opMap = top.get_str("ops").as_list().get(0).as_map();
    const docMeta = opMap.get_str("doc");
    expect(docMeta.kind()).toBe(CSL.TransactionMetadatumKind.MetadataList);
    const chunks = docMeta.as_list();
    expect(chunks.len()).toBeGreaterThan(1);
    for (let i = 0; i < chunks.len(); i++) {
      const chunk = chunks.get(i);
      expect(chunk.kind()).toBe(CSL.TransactionMetadatumKind.Bytes);
      expect(chunk.as_bytes().length).toBeLessThanOrEqual(64);
    }
  });

  it("keeps small docs as a single <=64B bytes element", () => {
    const op: DidOp = {
      k: "c",
      did: "did:web:a:b:c",
      h: "a".repeat(64),
      doc: { id: "x" },
      prev: null,
    };
    const aux = buildAuxiliaryData(makeMinimalInput({ ops: [op] }));
    const opMap = aux
      .metadata()!
      .get(CSL.BigNum.from_str("1985"))!
      .as_map()
      .get_str("ops")
      .as_list()
      .get(0)
      .as_map();
    const docMeta = opMap.get_str("doc");
    expect(docMeta.kind()).toBe(CSL.TransactionMetadatumKind.Bytes);
    expect(docMeta.as_bytes().length).toBeLessThanOrEqual(64);
  });

  // Regression test for the textAsChunkedList multibyte bug. A fixed-byte
  // split on UTF-8 will tear multi-byte chars at chunk boundaries, producing
  // invalid UTF-8 that Cardano serializers reject. The fix splits at
  // character boundaries while honouring the 64-byte limit.
  it("chunks long DIDs with multibyte UTF-8 at character boundaries (no torn chars)", () => {
    // Each Japanese char is 3 bytes in UTF-8. 30 chars ≈ 90 bytes > 64.
    const longJa =
      "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほ";
    const longDid = `did:web:api.civicship.app:users:${longJa}`;
    expect(new TextEncoder().encode(longDid).length).toBeGreaterThan(64);

    const op: DidOp = {
      k: "c",
      did: longDid,
      h: "a".repeat(64),
      doc: { id: longDid },
      prev: null,
    };
    const aux = buildAuxiliaryData(makeMinimalInput({ ops: [op] }));
    const opMap = aux
      .metadata()!
      .get(CSL.BigNum.from_str("1985"))!
      .as_map()
      .get_str("ops")
      .as_list()
      .get(0)
      .as_map();
    const didMeta = opMap.get_str("did");
    expect(didMeta.kind()).toBe(CSL.TransactionMetadatumKind.MetadataList);
    const chunks = didMeta.as_list();

    // Each chunk must be ≤ 64 bytes AND a valid UTF-8 string (not torn).
    let recombined = "";
    const fatal = new TextDecoder("utf-8", { fatal: true });
    for (let i = 0; i < chunks.len(); i++) {
      const chunk = chunks.get(i);
      expect(chunk.kind()).toBe(CSL.TransactionMetadatumKind.Text);
      const text = chunk.as_text();
      expect(new TextEncoder().encode(text).length).toBeLessThanOrEqual(64);
      // Round-trip through fatal decoder catches torn-multibyte regressions.
      expect(() => fatal.decode(new TextEncoder().encode(text))).not.toThrow();
      recombined += text;
    }
    // Concatenating chunks must reproduce the original string exactly.
    expect(recombined).toBe(longDid);
  });
});

describe("buildAuxiliaryData — 16 KB ceiling", () => {
  it("a small payload is well under 16 KB", () => {
    const aux = buildAuxiliaryData(makeMinimalInput());
    expect(metadataByteSize(aux)).toBeLessThan(MAX_METADATA_TX_BYTES);
  });

  it("buildAnchorTx throws a helpful error when metadata exceeds 16 KB", () => {
    const fatDoc: Record<string, unknown> = {
      id: "did:web:a",
      pad: "x".repeat(4096),
    };
    const ops: DidOp[] = Array.from({ length: 6 }, (_, i) => ({
      k: "c" as const,
      did: `did:web:api.civicship.app:users:u_fat${i}`,
      h: "a".repeat(64),
      doc: fatDoc,
      prev: null,
    }));
    const kp = deriveCardanoKeypair(new Uint8Array(32).fill(7), "preprod");

    expect(() =>
      buildAnchorTx({
        utxos: FAKE_UTXOS,
        params: PREPROD_PARAMS,
        signKey: kp.cslPrivateKey,
        auxiliaryData: buildAuxiliaryData(makeMinimalInput({ ops })),
        changeAddressBech32: kp.addressBech32,
        currentSlot: 50_000_000,
      }),
    ).toThrow(/exceeding the Cardano 16KB metadata ceiling/);
  });
});

describe("buildAnchorTx — sign + serialize end-to-end", () => {
  it("produces a tx whose CBOR round-trips through CSL Transaction.from_bytes", () => {
    const kp = deriveCardanoKeypair(new Uint8Array(32).fill(3), "preprod");
    const built = buildAnchorTx({
      utxos: FAKE_UTXOS,
      params: PREPROD_PARAMS,
      signKey: kp.cslPrivateKey,
      auxiliaryData: buildAuxiliaryData(makeMinimalInput()),
      changeAddressBech32: kp.addressBech32,
      currentSlot: 50_000_000,
    });
    expect(built.txHashHex).toMatch(/^[0-9a-f]{64}$/);
    expect(built.txCborBytes.length).toBeGreaterThan(0);
    expect(built.txCborBytes.length).toBeLessThanOrEqual(
      PREPROD_PARAMS.max_tx_size,
    );

    // Round-trip parse
    const reparsed = CSL.Transaction.from_bytes(built.txCborBytes);
    expect(reparsed.body().fee().to_str()).toBe(built.tx.body().fee().to_str());

    // Witness must contain exactly 1 vkeywitness over our tx-body hash.
    const vk = reparsed.witness_set().vkeys();
    expect(vk).toBeDefined();
    expect(vk!.len()).toBe(1);

    // AuxiliaryData must be present and contain label 1985.
    const aux = reparsed.auxiliary_data();
    expect(aux).toBeDefined();
    const top = aux!.metadata()!.get(CSL.BigNum.from_str("1985"));
    expect(top).toBeDefined();
  });

  it("rejects empty UTXO sets with an actionable error", () => {
    const kp = deriveCardanoKeypair(new Uint8Array(32).fill(5), "preprod");
    expect(() =>
      buildAnchorTx({
        utxos: [],
        params: PREPROD_PARAMS,
        signKey: kp.cslPrivateKey,
        auxiliaryData: buildAuxiliaryData(makeMinimalInput()),
        changeAddressBech32: kp.addressBech32,
        currentSlot: 50_000_000,
      }),
    ).toThrow(/no UTXOs/);
  });

  it("rejects when all UTXOs are multi-asset-only (no lovelace)", () => {
    const kp = deriveCardanoKeypair(new Uint8Array(32).fill(11), "preprod");
    expect(() =>
      buildAnchorTx({
        utxos: [
          {
            tx_hash: "0".repeat(64),
            output_index: 0,
            amount: [{ unit: "1234abcd.token", quantity: "1" }],
          },
        ],
        params: PREPROD_PARAMS,
        signKey: kp.cslPrivateKey,
        auxiliaryData: buildAuxiliaryData(makeMinimalInput()),
        changeAddressBech32: kp.addressBech32,
        currentSlot: 50_000_000,
      }),
    ).toThrow(/no usable lovelace UTXOs/);
  });
});
