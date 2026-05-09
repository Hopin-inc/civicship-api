/**
 * Phase 0 PoC Spike #2 — Cardano E2E
 *
 * merkle.ts
 *
 * Minimal Merkle tree builder using Blake2b-256 — the hash function the design
 * mandates for Cardano-side proof-of-inclusion. This is a self-contained
 * reimplementation, NOT a wrapper around @openzeppelin/merkle-tree, because:
 *
 *   1. OZ's tree defaults to keccak256; injecting Blake2b is non-trivial
 *      (the public API doesn't expose a hash override; you have to fork).
 *   2. The design promises a 3rd-party-verifiable spec
 *      (`docs/specs/civicship-merkle-anchor-2026.md`, §5.1.7) — for the spike
 *      we want to demonstrate the spec is implementable in <100 lines.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.7 (canonical leaf encoding)
 *   docs/report/did-vc-internalization.md §3.4 (@noble/hashes)
 *
 * Canonical encoding (locked spec, must NOT drift):
 *   - Input: leafIds = Transaction.id (cuid) array, ASCII-sorted ASC by caller.
 *   - leaf hash: blake2b( utf8_bytes(leafId), { dkLen: 32 } )
 *   - internal node: blake2b( leftBytes || rightBytes, { dkLen: 32 } )  // raw 32B concat
 *   - odd-leaf rule: duplicate the last leaf as right sibling (OZ-compatible)
 */

import { blake2b } from "@noble/hashes/blake2b";
import { utf8ToBytes, concatBytes } from "@noble/hashes/utils";

/** Hash a single transaction id (cuid string) into the canonical 32-byte leaf hash. */
export function canonicalLeafHash(leafId: string): Uint8Array {
  return blake2b(utf8ToBytes(leafId), { dkLen: 32 });
}

/** Hash two raw 32-byte nodes via concat || Blake2b-256. */
export function hashPair(a: Uint8Array, b: Uint8Array): Uint8Array {
  return blake2b(concatBytes(a, b), { dkLen: 32 });
}

/**
 * Build the Merkle root over the given leafIds.
 * Caller is responsible for ASCII-sorting leafIds ASC (per §5.1.7).
 *
 * Behavior:
 *   - 0 leaves: throws (callers should branch on count=0 — design §5.1.6 says
 *     the `vc` block can be omitted for empty weeks, NOT zero-padded)
 *   - 1 leaf: root = leaf hash itself (no internal nodes)
 *   - n leaves: layered hashing with last-leaf duplication on odd levels
 */
export function buildRoot(leafIds: string[]): Uint8Array {
  if (leafIds.length === 0) {
    throw new Error(
      "buildRoot: leafIds must be non-empty. The design (§5.1.6) says " +
        "empty Merkle blocks should be omitted from metadata, not anchored.",
    );
  }
  let level = leafIds.map(canonicalLeafHash);
  while (level.length > 1) {
    const next: Uint8Array[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = i + 1 < level.length ? level[i + 1] : level[i]; // duplicate
      next.push(hashPair(left, right));
    }
    level = next;
  }
  return level[0];
}

/**
 * Compute a proof-of-inclusion for the leaf at index `idx` in the canonical
 * tree built from `leafIds`. Returns the sibling hashes ordered bottom-up.
 *
 * Verification (for the third party):
 *   let cur = canonicalLeafHash(targetId);
 *   for each (sibling, position) in proof:
 *     cur = position==='right' ? hashPair(cur, sibling) : hashPair(sibling, cur)
 *   assert cur === root
 *
 * For simplicity this spike returns just the bytes, encoding sibling position
 * implicitly via the index parity at each level (same convention as OZ).
 */
export function getProof(leafIds: string[], idx: number): Uint8Array[] {
  if (leafIds.length === 0) throw new Error("getProof: empty leafIds");
  if (idx < 0 || idx >= leafIds.length) {
    throw new Error(`getProof: idx ${idx} out of range [0, ${leafIds.length})`);
  }

  const proof: Uint8Array[] = [];
  let level = leafIds.map(canonicalLeafHash);
  let cursor = idx;

  while (level.length > 1) {
    const isLeft = cursor % 2 === 0;
    const siblingIdx = isLeft ? cursor + 1 : cursor - 1;
    const sibling =
      siblingIdx < level.length ? level[siblingIdx] : level[cursor]; // odd-tail duplicates self
    proof.push(sibling);

    // Build next level
    const next: Uint8Array[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = i + 1 < level.length ? level[i + 1] : level[i];
      next.push(hashPair(left, right));
    }
    level = next;
    cursor = Math.floor(cursor / 2);
  }
  return proof;
}

/**
 * Verify a proof against an expected root. Used by tests + by 3rd-party
 * verifier scripts (Phase 0 0-4) — keep it dependency-free.
 */
export function verifyProof(
  leafId: string,
  idx: number,
  proof: Uint8Array[],
  root: Uint8Array,
): boolean {
  let cur = canonicalLeafHash(leafId);
  let cursor = idx;
  for (const sibling of proof) {
    const isLeft = cursor % 2 === 0;
    cur = isLeft ? hashPair(cur, sibling) : hashPair(sibling, cur);
    cursor = Math.floor(cursor / 2);
  }
  if (cur.length !== root.length) return false;
  for (let i = 0; i < cur.length; i++) if (cur[i] !== root[i]) return false;
  return true;
}
