/**
 * `JwtSigner` — abstraction over the signature production step for
 * Verifiable Credentials and StatusList VCs (§5.2.2 / §5.2.4).
 *
 * Why this interface exists (Phase 2 prep)
 * ----------------------------------------
 * `VcIssuanceService` and `StatusListService` both build a JWT of the
 * form `${headerB64u}.${payloadB64u}.${signature}`. In Phase 1 the
 * `signature` segment is a deterministic stub constant
 * (`STUB_SIGNATURE` / `STUB_SIGNATURE_STATUS`) because the KMS-backed
 * Ed25519 signer is still in PoC (Phase 0-2). When the KMS PoC graduates
 * (design doc §16, Phase 2 / PR #1101 + #1102) the signer becomes a
 * round-trip to Cloud KMS that produces a base64url-encoded Ed25519
 * signature — but the *call shape* from the application services is
 * exactly the same: feed them the unsigned `header.payload` string and
 * get back a string to splice in as the third JWT segment.
 *
 * Extracting that call shape behind an interface lets us:
 *
 *   1. Swap `StubJwtSigner` for `KmsJwtSigner` per DI token in Phase 2
 *      without touching service code.
 *   2. Run integration tests against `StubJwtSigner` even after KMS is
 *      wired up in production (deterministic output → stable snapshots).
 *   3. Bind *different* signers to the VC issuance path and the
 *      StatusList path if operations decide to rotate them on different
 *      cadences (two DI tokens — `VcJwtSigner` / `StatusListJwtSigner`).
 *
 * Boundary discipline
 * -------------------
 * The interface intentionally does NOT manage:
 *
 *   - JSON canonicalisation / base64url encoding — those live in the
 *     services so the JWT shape is testable without a signer mock.
 *   - The `kid` derivation from the active KMS key version — the
 *     `kid` field is read-only on the signer instance so the service
 *     can stamp the JWT header without learning the KMS resource name.
 *   - Caching / TTL — signature production has no inherent caching
 *     story (every payload is unique). Public-key caching for the
 *     verifier path lives in `IssuerDidService`.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.2 (VC issuance)
 *   docs/report/did-vc-internalization.md §5.2.4 (StatusList service)
 *   docs/report/did-vc-internalization.md §16    (Phase 2 carryover)
 */

/**
 * Production contract for "produce the third JWT segment for this
 * `header.payload` signing input".
 *
 * Implementations:
 *   - `StubJwtSigner`     — Phase 1, returns the same constant every call.
 *   - `KmsJwtSigner`      — Phase 2 placeholder; throws until the KMS
 *                           Ed25519 PoC graduates.
 */
export interface JwtSigner {
  /**
   * Produce the signature segment (third JWT component) for the supplied
   * signing input. The signing input is the ASCII string
   * `${headerB64u}.${payloadB64u}` exactly — implementations MUST NOT
   * re-canonicalise or re-encode it.
   *
   * Return value is the base64url-encoded signature (no padding, no `=`)
   * ready to be appended after the second `.` separator.
   *
   * Stubs may ignore the input and return a constant marker; real
   * implementations MUST sign over the raw bytes of `signingInput` using
   * the JWS algorithm declared in the JWT header (currently EdDSA /
   * Ed25519 per §5.2.2).
   */
  sign(signingInput: string): Promise<string>;

  /**
   * `kid` (key id) to stamp on the JWT header. Stable for the lifetime
   * of a signer instance — Phase 2 rotation will hand the service a
   * *new* signer instance rather than mutating this field, so callers
   * may read it eagerly.
   *
   * Format: `${issuerDid}#${keyFragment}` — e.g.
   * `did:web:api.civicship.app#stub` for the Phase 1 stub. The fragment
   * portion becomes the `verificationMethod` id in the DID Document.
   */
  readonly kid: string;
}
