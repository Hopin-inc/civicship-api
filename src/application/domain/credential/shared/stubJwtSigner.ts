/**
 * `StubJwtSigner` — Phase 1 placeholder implementation of `JwtSigner`.
 *
 * Emits a deterministic, non-signature marker as the JWT signature
 * segment so:
 *
 *   1. Tests can assert "this is a stub VC" with a single string
 *      comparison and without false positives against real signatures.
 *   2. Verifiers MUST reject it — it is not a valid Ed25519 signature
 *      (wrong length and format), which is exactly what we want until
 *      the KMS signer lands. (The `-` chars in the marker are
 *      base64url-legal, so the failure mode is "signature does not
 *      verify", not "signature is not parseable".)
 *   3. The grep target is unique enough to find every stub site once
 *      KMS replaces the stub in Phase 2.
 *
 * Two instances are wired in `src/application/provider.ts`:
 *
 *   - `VcJwtSigner`         → emits `STUB_SIGNATURE` for VC issuance.
 *   - `StatusListJwtSigner` → emits `STUB_SIGNATURE_STATUS` for the
 *                              StatusList VC body.
 *
 * The two markers are kept distinct (rather than reusing one) so a
 * post-hoc grep can disambiguate which stub a captured JWT came from
 * while we are mid-migration.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.2
 *   docs/report/did-vc-internalization.md §5.2.4
 *   docs/report/did-vc-internalization.md §16 (Phase 2 carryover)
 */

import type { JwtSigner } from "@/application/domain/credential/shared/jwtSigner";

/**
 * Stub signature for issued VCs. Distinct from the StatusList stub.
 * Keep in sync with `src/application/domain/credential/vcIssuance/service.ts`
 * pre-extraction — the constant value MUST NOT change because existing
 * unit tests pin it.
 */
export const STUB_SIGNATURE = "stub-not-signed";

/**
 * Stub signature for the StatusList VC. Kept distinct from `STUB_SIGNATURE`
 * so the JWT origin can be identified by grep alone during the Phase 2
 * cutover.
 */
export const STUB_SIGNATURE_STATUS = "stub-status-list-not-signed";

/**
 * Construct-time configured `JwtSigner` returning a fixed signature
 * marker and a fixed `kid`. Stateless — safe to register as a singleton.
 *
 * `sign()` ignores the signing input deliberately; production verifiers
 * would reject the output anyway because it is not a valid Ed25519
 * signature.
 */
export class StubJwtSigner implements JwtSigner {
  /**
   * JWS algorithm advertised on the JWT header. Phase 1 runs EdDSA
   * (Ed25519, RFC 8037) so the header reflects the algorithm the Phase
   * 2 KMS signer will eventually produce — the *signature value* is the
   * only piece that changes when the stub is replaced.
   */
  readonly alg: string = "EdDSA";

  /**
   * `kid` is read by the service when assembling the JWT header. Phase 1
   * stamps `${issuerDid}#stub` so the verifier path can route to the
   * stub `verificationMethod` (which doesn't actually verify anything —
   * the design accepts that during the stub window).
   */
  readonly kid: string;

  /**
   * The constant returned by `sign()`. Two production instances differ
   * only by this value (`STUB_SIGNATURE` vs `STUB_SIGNATURE_STATUS`).
   */
  private readonly stubSignature: string;

  constructor(params: { kid: string; stubSignature: string }) {
    this.kid = params.kid;
    this.stubSignature = params.stubSignature;
  }

  /**
   * Returns the configured stub marker. The `signingInput` argument is
   * preserved on the interface (rather than being optional) because the
   * Phase 2 `KmsJwtSigner` MUST receive it — making it optional would
   * leak the stub's "I don't care" semantics into the production type.
   */
  async sign(_signingInput: string): Promise<string> {
    return this.stubSignature;
  }
}
