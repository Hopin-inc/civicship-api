/**
 * Merkle tree builder for civicship Cardano-side anchoring.
 *
 * Pure functions only — no I/O, no Prisma, no DI. Callers are responsible for
 * supplying canonically-ordered leafIds (ASCII byte ascending, see §5.1.7).
 *
 * Why a self-contained Blake2b-256 implementation rather than wrapping
 * `@openzeppelin/merkle-tree`?
 *
 *   1. OZ's tree defaults to keccak256; injecting Blake2b is non-trivial
 *      because its public API does not expose a hash override.
 *   2. The §5.1.7 spec must be third-party-verifiable (see
 *      `docs/specs/civicship-merkle-anchor-2026.md`). Keeping the implementation
 *      under ~100 LOC makes the spec independently reproducible.
 *   3. Cardano-native hashing (Blake2b-256) keeps the on-chain root and
 *      off-chain leaves under a single hash family.
 *
 * Canonical encoding (locked spec — must NOT drift):
 *   - leafIds: caller-sorted (ORDER BY id ASC) Transaction.id (cuid) array.
 *   - leaf hash: blake2b( utf8_bytes(leafId), { dkLen: 32 } )
 *   - internal node: blake2b( leftBytes || rightBytes, { dkLen: 32 } )
 *     using raw 32-byte concat — never hex-encode then concat.
 *   - Odd-leaf rule: duplicate the last leaf as right sibling
 *     (OZ-compatible behaviour).
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.7 (canonical leaf encoding)
 *   docs/report/did-vc-internalization.md §3.4 (採用ライブラリ — @noble/hashes)
 */

import { blake2b } from "@noble/hashes/blake2b";
import { utf8ToBytes, concatBytes } from "@noble/hashes/utils";

/** Output length of a single Merkle node, in bytes (Blake2b-256 → 32B). */
export const MERKLE_NODE_BYTES = 32;

/** Hash a single transaction id (cuid string) into the canonical 32-byte leaf hash. */
export function canonicalLeafHash(leafId: string): Uint8Array {
  return blake2b(utf8ToBytes(leafId), { dkLen: MERKLE_NODE_BYTES });
}

/** Hash two raw 32-byte nodes via concat || Blake2b-256. */
export function hashPair(a: Uint8Array, b: Uint8Array): Uint8Array {
  return blake2b(concatBytes(a, b), { dkLen: MERKLE_NODE_BYTES });
}

/**
 * Build the Merkle root over the given leafIds.
 * Caller is responsible for ASCII-sorting leafIds ASC (per §5.1.7).
 *
 * Behavior:
 *   - 0 leaves: throws. Per design §5.1.6 the `vc` block (and `tx` block) is
 *     omitted entirely on empty weeks; never anchor a zero-padded root.
 *   - 1 leaf: root === leaf hash itself (no internal nodes).
 *   - n leaves: layered hashing with last-leaf duplication on odd levels.
 */
export function buildRoot(leafIds: string[]): Uint8Array {
  if (leafIds.length === 0) {
    throw new Error(
      "buildRoot: leafIds must be non-empty. Per design §5.1.6, empty Merkle " +
        "blocks must be omitted from metadata, not anchored as a zero-padded root.",
    );
  }
  let level = leafIds.map(canonicalLeafHash);
  while (level.length > 1) {
    const next: Uint8Array[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = i + 1 < level.length ? level[i + 1] : level[i]; // duplicate last
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
 * The verifier reconstructs the position of each sibling implicitly from the
 * index parity at each level (same convention as OpenZeppelin's tree). This
 * keeps the on-wire proof minimal — just the bytes — at the cost of requiring
 * the verifier to know `idx`. We always serialize `idx` alongside the proof
 * (see §5.4.6 `/vc/:vcId/inclusion-proof`).
 */
export function getProof(leafIds: string[], idx: number): Uint8Array[] {
  if (leafIds.length === 0) {
    throw new Error("getProof: leafIds must be non-empty");
  }
  if (!Number.isInteger(idx) || idx < 0 || idx >= leafIds.length) {
    throw new Error(`getProof: idx ${idx} out of range [0, ${leafIds.length})`);
  }

  const proof: Uint8Array[] = [];
  let level = leafIds.map(canonicalLeafHash);
  let cursor = idx;

  while (level.length > 1) {
    const isLeft = cursor % 2 === 0;
    const siblingIdx = isLeft ? cursor + 1 : cursor - 1;
    // Odd-tail: when there is no right sibling at this level, duplicate self.
    const sibling =
      siblingIdx < level.length ? level[siblingIdx] : level[cursor];
    proof.push(sibling);

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
 * Verify a proof against an expected root.
 *
 * Used by tests and by third-party verifier scripts. Kept dependency-free
 * (no `Buffer`, no node `crypto`) so it can be ported to a browser bundle
 * without changes when civicship-portal lands the verifier UI (§11 Phase 4).
 *
 * Inputs:
 *   - leafId: the cuid string at index `idx`.
 *   - idx:    leaf position in the original (sorted) leafIds array.
 *   - proof:  sibling list returned by getProof().
 *   - root:   the 32-byte root that was anchored on-chain.
 */
export function verifyProof(
  leafId: string,
  idx: number,
  proof: Uint8Array[],
  root: Uint8Array,
): boolean {
  if (root.length !== MERKLE_NODE_BYTES) return false;
  let cur = canonicalLeafHash(leafId);
  let cursor = idx;
  for (const sibling of proof) {
    if (sibling.length !== MERKLE_NODE_BYTES) return false;
    const isLeft = cursor % 2 === 0;
    cur = isLeft ? hashPair(cur, sibling) : hashPair(sibling, cur);
    cursor = Math.floor(cursor / 2);
  }
  return bytesEqual(cur, root);
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
