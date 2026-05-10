/**
 * Unit tests for `src/infrastructure/libs/merkle/merkleTreeBuilder.ts`.
 *
 * Covers:
 *   - Blake2b-256 against the canonical "abc" test vector
 *   - canonicalLeafHash equality with raw blake2b(utf8(id), 32)
 *   - root determinism + ordering sensitivity
 *   - single / odd / even leaf counts
 *   - getProof / verifyProof round-trip for every index
 *   - tampered proofs rejected
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.7
 */

import { blake2b } from "@noble/hashes/blake2b";
import {
  buildRoot,
  canonicalLeafHash,
  getProof,
  verifyProof,
  hashPair,
  MERKLE_NODE_BYTES,
} from "@/infrastructure/libs/merkle/merkleTreeBuilder";

function bytesToHex(b: Uint8Array): string {
  return Array.from(b)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

describe("merkleTreeBuilder — Blake2b-256 vectors", () => {
  // Blake2b-256 of "abc" — canonical vector, matches @noble/hashes test
  // suite + python-blake2 / RFC 7693-style reference implementations.
  it("blake2b('abc', 32) matches the canonical vector", () => {
    const got = blake2b(new TextEncoder().encode("abc"), {
      dkLen: MERKLE_NODE_BYTES,
    });
    expect(bytesToHex(got)).toBe(
      "bddd813c634239723171ef3fee98579b94964e3bb1cb3e427262c8c068d52319",
    );
  });

  // Blake2b-512 of "abc" — RFC 7693 Appendix A canonical vector. Cross-check
  // at the dkLen=64 setting confirms the underlying Blake2b is the right one.
  it("blake2b('abc', 64) matches RFC 7693 Appendix A", () => {
    const got = blake2b(new TextEncoder().encode("abc"), { dkLen: 64 });
    expect(bytesToHex(got)).toBe(
      "ba80a53f981c4d0d6a2797b69f12f6e94c212f14685ac4b74b12bb6fdbffa2d1" +
        "7d87c5392aab792dc252d5de4533cc9518d38aa8dbf1925ab92386edd4009923",
    );
  });

  it("canonicalLeafHash is exactly Blake2b-256(utf8(id))", () => {
    const id = "tx_ckabc0001";
    const direct = blake2b(new TextEncoder().encode(id), {
      dkLen: MERKLE_NODE_BYTES,
    });
    expect(bytesToHex(canonicalLeafHash(id))).toBe(bytesToHex(direct));
  });

  it("hashPair concatenates raw bytes (NOT hex)", () => {
    const a = new Uint8Array(32).fill(0x11);
    const b = new Uint8Array(32).fill(0x22);
    const expected = blake2b(
      new Uint8Array([...a, ...b]),
      { dkLen: MERKLE_NODE_BYTES },
    );
    expect(bytesToHex(hashPair(a, b))).toBe(bytesToHex(expected));
  });
});

describe("merkleTreeBuilder — root determinism + edge cases", () => {
  it("same input produces same root", () => {
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
    expect(root.length).toBe(MERKLE_NODE_BYTES);
  });
});

describe("merkleTreeBuilder — proof round-trip", () => {
  const ids = ["a", "b", "c", "d", "e", "f", "g"]; // 7 leaves (odd, exercises tail dup)

  it("verifyProof returns true for every index in a 7-leaf tree", () => {
    const root = buildRoot(ids);
    for (let i = 0; i < ids.length; i++) {
      const proof = getProof(ids, i);
      expect(verifyProof(ids[i], i, proof, root)).toBe(true);
    }
  });

  it("verifyProof returns true for every index in a 4-leaf (full) tree", () => {
    const four = ["a", "b", "c", "d"];
    const root = buildRoot(four);
    for (let i = 0; i < four.length; i++) {
      const proof = getProof(four, i);
      expect(verifyProof(four[i], i, proof, root)).toBe(true);
    }
  });

  it("single-leaf proof is empty and verifies", () => {
    const root = buildRoot(["only"]);
    const proof = getProof(["only"], 0);
    expect(proof.length).toBe(0);
    expect(verifyProof("only", 0, proof, root)).toBe(true);
  });

  it("tampered proof rejects (defensive check)", () => {
    const root = buildRoot(ids);
    const proof = getProof(ids, 0);
    proof[0] = new Uint8Array(MERKLE_NODE_BYTES).fill(0xff);
    expect(verifyProof("a", 0, proof, root)).toBe(false);
  });

  it("wrong leafId rejects", () => {
    const root = buildRoot(ids);
    const proof = getProof(ids, 0);
    expect(verifyProof("WRONG", 0, proof, root)).toBe(false);
  });

  it("wrong index rejects", () => {
    const root = buildRoot(ids);
    const proof = getProof(ids, 0);
    expect(verifyProof("a", 1, proof, root)).toBe(false);
  });

  it("verifyProof returns false on root with wrong length", () => {
    const proof = getProof(["a", "b"], 0);
    const badRoot = new Uint8Array(16).fill(0); // 16 bytes != 32
    expect(verifyProof("a", 0, proof, badRoot)).toBe(false);
  });

  it("getProof rejects out-of-range idx with actionable error", () => {
    expect(() => getProof(["a", "b"], 5)).toThrow(/out of range/);
    expect(() => getProof(["a", "b"], -1)).toThrow(/out of range/);
    expect(() => getProof([], 0)).toThrow(/non-empty/);
  });
});
