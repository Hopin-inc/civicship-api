/**
 * Phase 0 PoC Spike #2 — Cardano E2E
 *
 * Unit tests (no network). Exercises:
 *   - metadata structure: keys present (v, bid, ts, tx, vc, ops)
 *   - 64-byte chunking works for >64B values
 *   - 16KB total bound + helpful error
 *   - Merkle root determinism (single leaf, even, odd)
 *   - Blake2b-256 against known test vector (RFC 7693 Appendix A test set)
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.6, §5.1.7
 */

import * as CSL from "@emurgo/cardano-serialization-lib-nodejs";
import { blake2b } from "@noble/hashes/blake2b";
import {
  buildMetadata,
  metadataByteSize,
  MAX_METADATA_TX_BYTES,
  buildAnchorTxFromSpec,
  type BuildMetadataInput,
  type DidOp,
  type BlockfrostUtxo,
  type BlockfrostProtocolParams,
} from "../build-tx";
import { buildRoot, canonicalLeafHash, getProof, verifyProof } from "../merkle";
import { deriveCardanoPreprodKeypair } from "../keygen";

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

function bytesToHex(b: Uint8Array): string {
  return Array.from(b)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

function makeMinimalInput(overrides: Partial<BuildMetadataInput> = {}): BuildMetadataInput {
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

describe("buildMetadata — §5.1.6 structure", () => {
  it("includes all top-level keys (v, bid, ts, tx, vc, ops)", () => {
    const aux = buildMetadata(makeMinimalInput());
    const general = aux.metadata();
    expect(general).toBeDefined();

    const top = general!.get(CSL.BigNum.from_str("1985"));
    expect(top).toBeDefined();
    const map = top!.as_map();

    // CSL throws if a key is missing → use try/catch to assert presence
    expect(() => map.get_str("v")).not.toThrow();
    expect(() => map.get_str("bid")).not.toThrow();
    expect(() => map.get_str("ts")).not.toThrow();
    expect(() => map.get_str("tx")).not.toThrow();
    expect(() => map.get_str("vc")).not.toThrow();
    expect(() => map.get_str("ops")).not.toThrow();
  });

  it("omits the vc block when not provided (§5.1.6 'count=0 is省略可')", () => {
    const aux = buildMetadata(
      makeMinimalInput({ vc: undefined }),
    );
    const top = aux.metadata()!.get(CSL.BigNum.from_str("1985"))!.as_map();
    expect(() => top.get_str("vc")).toThrow();
    expect(() => top.get_str("tx")).not.toThrow();
  });

  it("encodes ops list with the right length", () => {
    const ops: DidOp[] = [
      { k: "c", did: "did:web:a:b:c", h: "a".repeat(64), doc: { id: "x" }, prev: null },
      { k: "u", did: "did:web:a:b:c", h: "b".repeat(64), doc: { id: "x" }, prev: "f".repeat(64) },
      { k: "d", did: "did:web:a:b:c", prev: "f".repeat(64) },
    ];
    const aux = buildMetadata(makeMinimalInput({ ops }));
    const top = aux.metadata()!.get(CSL.BigNum.from_str("1985"))!.as_map();
    const opsList = top.get_str("ops").as_list();
    expect(opsList.len()).toBe(3);
  });
});

describe("buildMetadata — 64-byte chunking", () => {
  it("chunks a long DID Document into a list of <=64B byte segments", () => {
    // ~2KB doc → multiple chunks
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
    const aux = buildMetadata(makeMinimalInput({ ops: [op] }));
    const top = aux.metadata()!.get(CSL.BigNum.from_str("1985"))!.as_map();
    const opsList = top.get_str("ops").as_list();
    const opMap = opsList.get(0).as_map();
    const docMeta = opMap.get_str("doc");
    expect(docMeta.kind()).toBe(CSL.TransactionMetadatumKind.MetadataList); // chunked
    const chunks = docMeta.as_list();
    expect(chunks.len()).toBeGreaterThan(1);
    for (let i = 0; i < chunks.len(); i++) {
      const chunk = chunks.get(i);
      expect(chunk.kind()).toBe(CSL.TransactionMetadatumKind.Bytes);
      const raw = chunk.as_bytes();
      expect(raw.length).toBeLessThanOrEqual(64);
    }
  });

  it("keeps small docs as a single <=64B bytes element", () => {
    const op: DidOp = {
      k: "c",
      did: "did:web:a:b:c",
      h: "a".repeat(64),
      doc: { id: "x" }, // tiny
      prev: null,
    };
    const aux = buildMetadata(makeMinimalInput({ ops: [op] }));
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

  // Regression test for the textAsChunkedList multibyte bug (Gemini review):
  // a fixed-byte split on UTF-8 will tear multi-byte chars at chunk boundaries,
  // producing invalid UTF-8 that Cardano serializers reject. The fix splits at
  // character boundaries while honouring the 64-byte limit.
  it("chunks a long DID with multibyte characters at character boundaries", () => {
    // Each Japanese char is 3 bytes in UTF-8. 30 chars = 90 bytes, exceeds 64.
    // (Realistic for did:web with `users:` followed by a Japanese identifier in
    // a future i18n scenario.)
    const longJa = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほ";
    const longDid = `did:web:api.civicship.app:users:${longJa}`;
    expect(new TextEncoder().encode(longDid).length).toBeGreaterThan(64);

    const op: DidOp = {
      k: "c",
      did: longDid,
      h: "a".repeat(64),
      doc: { id: longDid },
      prev: null,
    };
    const aux = buildMetadata(makeMinimalInput({ ops: [op] }));
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

    // Each chunk must be <= 64 bytes AND a valid UTF-8 string (not torn).
    let recombined = "";
    const fatal = new TextDecoder("utf-8", { fatal: true });
    for (let i = 0; i < chunks.len(); i++) {
      const chunk = chunks.get(i);
      expect(chunk.kind()).toBe(CSL.TransactionMetadatumKind.Text);
      const text = chunk.as_text();
      expect(new TextEncoder().encode(text).length).toBeLessThanOrEqual(64);
      // Round-trip through fatal decoder catches torn-multibyte regressions.
      expect(() =>
        fatal.decode(new TextEncoder().encode(text)),
      ).not.toThrow();
      recombined += text;
    }
    // Concatenating the chunks must reproduce the original string exactly.
    expect(recombined).toBe(longDid);
  });
});

describe("buildMetadata — 16KB ceiling", () => {
  it("a small payload is well under 16KB", () => {
    const aux = buildMetadata(makeMinimalInput());
    expect(metadataByteSize(aux)).toBeLessThan(MAX_METADATA_TX_BYTES);
  });

  it("buildAnchorTx throws a helpful error when metadata exceeds 16KB", async () => {
    // Construct an op set whose CBOR-encoded doc fields collectively blow past 16KB.
    const fatDoc: Record<string, unknown> = {
      id: "did:web:a",
      // 4KB of padding inside the doc
      pad: "x".repeat(4096),
    };
    const ops: DidOp[] = Array.from({ length: 6 }, (_, i) => ({
      k: "c" as const,
      did: `did:web:api.civicship.app:users:u_fat${i}`,
      h: "a".repeat(64),
      doc: fatDoc,
      prev: null,
    }));
    const kp = await deriveCardanoPreprodKeypair(new Uint8Array(32).fill(7));

    expect(() =>
      buildAnchorTxFromSpec(makeMinimalInput({ ops }), {
        utxos: FAKE_UTXOS,
        params: PREPROD_PARAMS,
        signKey: kp.cslPrivateKey,
        changeAddressBech32: kp.preprodAddressBech32,
        currentSlot: 50_000_000,
      }),
    ).toThrow(/exceeding the Cardano 16KB metadata ceiling/);
  });
});

describe("buildAnchorTx — sign + serialize end-to-end", () => {
  it("produces a tx whose CBOR round-trips through CSL Transaction.from_bytes", async () => {
    const kp = await deriveCardanoPreprodKeypair(new Uint8Array(32).fill(3));
    const built = buildAnchorTxFromSpec(makeMinimalInput(), {
      utxos: FAKE_UTXOS,
      params: PREPROD_PARAMS,
      signKey: kp.cslPrivateKey,
      changeAddressBech32: kp.preprodAddressBech32,
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

    // The witness must contain exactly 1 vkeywitness over our tx-body hash.
    const vk = reparsed.witness_set().vkeys();
    expect(vk).toBeDefined();
    expect(vk!.len()).toBe(1);

    // AuxiliaryData must be present and contain label 1985.
    const aux = reparsed.auxiliary_data();
    expect(aux).toBeDefined();
    const top = aux!.metadata()!.get(CSL.BigNum.from_str("1985"));
    expect(top).toBeDefined();
  });

  it("rejects empty UTXO sets with an actionable error", async () => {
    const kp = await deriveCardanoPreprodKeypair(new Uint8Array(32).fill(5));
    expect(() =>
      buildAnchorTxFromSpec(makeMinimalInput(), {
        utxos: [],
        params: PREPROD_PARAMS,
        signKey: kp.cslPrivateKey,
        changeAddressBech32: kp.preprodAddressBech32,
        currentSlot: 50_000_000,
      }),
    ).toThrow(/no UTXOs/);
  });
});

describe("merkle — Blake2b-256 against known test vector", () => {
  // Blake2b-256 of "abc" — taken from the @noble/hashes test suite (and
  // matches python-blake2 / blake2b reference implementation):
  //   blake2b("abc", 32) ==
  //     bddd813c634239723171ef3fee98579b94964e3bb1cb3e427262c8c068d52319
  it("blake2b('abc', 32) matches the canonical vector", () => {
    const got = blake2b(new TextEncoder().encode("abc"), { dkLen: 32 });
    expect(bytesToHex(got)).toBe(
      "bddd813c634239723171ef3fee98579b94964e3bb1cb3e427262c8c068d52319",
    );
  });

  // Blake2b-512 of "abc" — RFC 7693 Appendix A canonical vector. Cross-check
  // at the dkLen=64 setting.
  it("blake2b('abc', 64) matches RFC 7693 Appendix A", () => {
    const got = blake2b(new TextEncoder().encode("abc"), { dkLen: 64 });
    expect(bytesToHex(got)).toBe(
      "ba80a53f981c4d0d6a2797b69f12f6e94c212f14685ac4b74b12bb6fdbffa2d1" +
        "7d87c5392aab792dc252d5de4533cc9518d38aa8dbf1925ab92386edd4009923",
    );
  });

  it("canonicalLeafHash is exactly Blake2b-256(utf8(id))", () => {
    const id = "tx_ckabc0001";
    const direct = blake2b(new TextEncoder().encode(id), { dkLen: 32 });
    expect(bytesToHex(canonicalLeafHash(id))).toBe(bytesToHex(direct));
  });
});

describe("merkle — root determinism + edge cases", () => {
  it("same input produces same root (determinism)", () => {
    const a = buildRoot(["a", "b", "c", "d"]);
    const b = buildRoot(["a", "b", "c", "d"]);
    expect(bytesToHex(a)).toBe(bytesToHex(b));
  });

  it("different ordering produces different root (canonical-order matters)", () => {
    const sorted = buildRoot(["a", "b", "c", "d"]);
    const reversed = buildRoot(["d", "c", "b", "a"]);
    expect(bytesToHex(sorted)).not.toBe(bytesToHex(reversed));
  });

  it("single leaf: root === leafHash", () => {
    const id = "lonely-leaf";
    const root = buildRoot([id]);
    expect(bytesToHex(root)).toBe(bytesToHex(canonicalLeafHash(id)));
  });

  it("rejects empty input with explicit error (§5.1.6 omit-empty rule)", () => {
    expect(() => buildRoot([])).toThrow(/non-empty/);
  });

  it("odd leaf count uses last-leaf duplication (5 leaves)", () => {
    const five = ["a", "b", "c", "d", "e"];
    const six = ["a", "b", "c", "d", "e", "e"]; // explicit duplicate
    expect(bytesToHex(buildRoot(five))).toBe(bytesToHex(buildRoot(six)));
  });

  it("even leaf count works (4 leaves, full binary tree)", () => {
    const root = buildRoot(["a", "b", "c", "d"]);
    expect(root.length).toBe(32);
    // Verify proof for each index round-trips
    for (let i = 0; i < 4; i++) {
      const proof = getProof(["a", "b", "c", "d"], i);
      expect(verifyProof(["a", "b", "c", "d"][i], i, proof, root)).toBe(true);
    }
  });

  it("proofs verify for all indices, even with odd-leaf duplication", () => {
    const ids = ["a", "b", "c", "d", "e", "f", "g"]; // 7 leaves
    const root = buildRoot(ids);
    for (let i = 0; i < ids.length; i++) {
      const proof = getProof(ids, i);
      expect(verifyProof(ids[i], i, proof, root)).toBe(true);
    }
  });

  it("invalid proof rejects (defensive check)", () => {
    const ids = ["a", "b", "c", "d"];
    const root = buildRoot(ids);
    const proof = getProof(ids, 0);
    // tamper with proof
    proof[0] = new Uint8Array(32).fill(0xff);
    expect(verifyProof("a", 0, proof, root)).toBe(false);
  });
});
