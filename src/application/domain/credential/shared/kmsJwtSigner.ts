/**
 * `KmsJwtSigner` — Phase 2 placeholder implementation of `JwtSigner`.
 *
 * Throws on every method until the Phase 0-2 KMS Ed25519 PoC graduates
 * (design doc §16 — "VC JWT の本番署名" / "StatusList VC JWT の本番署名").
 *
 * Why this file exists *before* the PoC lands
 * -------------------------------------------
 * Phase 2 will require:
 *
 *   1. A `KmsJwtSigner` class that delegates `sign()` to
 *      `IssuerDidService.signWithActiveKey` (or directly to `KmsSigner`)
 *      and exposes the active key's `kid`.
 *   2. A DI swap from `StubJwtSigner` → `KmsJwtSigner` on the
 *      `VcJwtSigner` / `StatusListJwtSigner` tokens.
 *
 * Shipping the placeholder now means the Phase 2 PR is a small,
 * surgical diff: rewrite this file's method bodies, flip the DI
 * binding. Nothing in the consuming services has to move.
 *
 * Intentionally NOT implemented in this PR
 * ----------------------------------------
 *   - No call to `KmsSigner.signEd25519` — the PoC has not yet validated
 *     the algorithm choice / IAM scope / latency budget.
 *   - No `IssuerDidService` injection — pulling that in here before the
 *     PoC would couple the placeholder to a class that may itself be
 *     refactored as part of Phase 2.
 *   - No `kid` resolution from `t_issuer_did_keys.kmsKeyResourceName` —
 *     same reason; the wiring belongs in the same PR as the working
 *     `sign()` body so the change can be reviewed as one coherent
 *     diff.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §16    (Phase 2 carryover)
 *   docs/report/did-vc-internalization.md §5.1.1 (KMS resource naming)
 *   docs/report/did-vc-internalization.md §5.4.3 (Issuer DID + KMS signing)
 */

import type { JwtSigner } from "@/application/domain/credential/shared/jwtSigner";

/**
 * Placeholder for the future KMS-backed `JwtSigner`. Every method
 * throws — production code MUST NOT bind this class to a DI token in
 * Phase 1. The DI provider currently registers `StubJwtSigner` against
 * both `VcJwtSigner` and `StatusListJwtSigner` tokens for that reason.
 */
export class KmsJwtSigner implements JwtSigner {
  /**
   * JWS algorithm identifier. Symmetric with the other throwing
   * getters on this placeholder — accessed at JWT-build time, so
   * fails fast with the same diagnostic the moment something tries
   * to use the unwired KMS signer in Phase 1.
   *
   * Implemented as a getter so the throw fires on *access*, not on
   * instantiation, mirroring `kid` / `sign`. Phase 2 will replace this
   * with a literal `"EdDSA"` (the KMS key is Ed25519 per §5.1.1).
   */
  get alg(): string {
    throw new Error(
      "KmsJwtSigner.alg: not implemented — Phase 0-2 PoC pending. " +
        "See docs/report/did-vc-internalization.md §16.",
    );
  }

  /**
   * Property is declared (and read by TypeScript at compile time) so
   * the class structurally satisfies `JwtSigner`. Accessing it throws
   * — symmetric with `sign()` — so a misconfigured DI binding fails
   * fast with the same diagnostic.
   *
   * Implemented as a getter (not a plain field) so the throw fires on
   * *access*, not on instantiation. Phase 2 will replace this with a
   * real value derived from `t_issuer_did_keys`.
   */
  get kid(): string {
    throw new Error(
      "KmsJwtSigner.kid: not implemented — Phase 0-2 PoC pending. " +
        "See docs/report/did-vc-internalization.md §16.",
    );
  }

  async sign(_signingInput: string): Promise<string> {
    throw new Error(
      "KmsJwtSigner.sign: not implemented — Phase 0-2 PoC pending. " +
        "See docs/report/did-vc-internalization.md §16. " +
        "Wire `StubJwtSigner` against the `VcJwtSigner` / `StatusListJwtSigner` " +
        "DI tokens until the PoC graduates.",
    );
  }
}
