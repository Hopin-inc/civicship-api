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
   * JWS algorithm identifier stamped on the JWT header's `alg` field.
   *
   * Civicship runs EdDSA / Ed25519 (§5.2.2, RFC 8037), but pinning it
   * to the signer instance instead of the call site means the eventual
   * KMS swap (or any future migration to ES256K / etc.) flips one
   * implementation property rather than every caller. Service-layer
   * code MUST read `signer.alg` rather than hard-coding the string.
   */
  readonly alg: string;

  /**
   * Refresh / acquire any state required for `alg` and `kid` to be safe
   * to read synchronously. Callers MUST `await signer.prepare()` before
   * reading those properties for a new operation.
   *
   * Why this exists
   * ---------------
   * The KMS-backed signer resolves the active key version from
   * `t_issuer_did_keys` to derive its `kid`. That lookup is async, but
   * the JWT-building call site (`vcIssuance/service.ts`,
   * `statusList/service.ts`) reads `signer.kid` synchronously when
   * assembling the JWS header. `prepare()` lets the signer snapshot the
   * active key once per logical operation (and rotate on a TTL) without
   * forcing every caller through `await getKid()` plumbing.
   *
   * `StubJwtSigner` implements this as a no-op since its `kid` is
   * configured at construction time.
   *
   * Idempotent — repeated calls within the implementation's snapshot TTL
   * are cheap (no KMS / DB round-trips).
   */
  prepare(): Promise<void>;

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
   * Ed25519 per §5.2.2). Implementations MAY internally re-invoke
   * `prepare()` to guarantee a fresh snapshot before signing.
   */
  sign(signingInput: string): Promise<string>;

  /**
   * `kid` (key id) to stamp on the JWT header. Safe to read synchronously
   * **after `await prepare()`** for the current operation. Phase 2 rotation
   * updates this on the next `prepare()` call, NOT mid-operation, so a
   * single VC issuance always stamps and signs with the same key.
   *
   * Format: `${issuerDid}#${keyFragment}` — e.g.
   * `did:web:api.civicship.app#stub` for the Phase 1 stub or
   * `did:web:api.civicship.app#key-3` for the Phase 2 KMS signer. The
   * fragment portion becomes the `verificationMethod` id in the DID
   * Document.
   *
   * Implementations MUST throw on access before the first `prepare()` so
   * misuse fails loudly rather than producing a JWT stamped with a stale
   * / undefined key id.
   */
  readonly kid: string;
}
