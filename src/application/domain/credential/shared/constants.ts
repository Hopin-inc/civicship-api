/**
 * Shared constants for the `credential` application domains
 * (`vcIssuance`, `statusList`, future `vcAnchor` …).
 *
 * Why this module exists:
 *   `statusList` and `vcIssuance` both need the platform issuer DID. Before
 *   this file existed `statusList/service.ts` imported `CIVICSHIP_ISSUER_DID`
 *   from `vcIssuance/service.ts`, which is the wrong dependency direction —
 *   the StatusList service is consumed by VC issuance, not the other way
 *   round. Hoisting the constant here keeps both modules pointing at a
 *   neutral location.
 *
 * The original `vcIssuance/service.ts` export is kept as a re-export so the
 * symbol's public name doesn't change for tests and the sibling KMS PR.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §B     (issuer DID — civicship.app)
 *   docs/report/did-vc-internalization.md §5.2.2 (VC issuance)
 *   docs/report/did-vc-internalization.md §5.2.4 (StatusList service)
 */

/**
 * Civicship platform issuer DID. Hardcoded per §B / §5.2.2 — civicship is
 * a platform-issued credential model so there is exactly one issuer.
 *
 * TODO(phase1-final): replace with `IssuerDidService.getActiveIssuerDid()`
 * once the KMS issuer DID PR (`claude/phase1-infra-kms-issuer-did`) lands.
 * Both `vcIssuance/service.ts` and `statusList/service.ts` will then read
 * the active DID from the KMS-backed service instead of this constant.
 */
export const CIVICSHIP_ISSUER_DID = "did:web:api.civicship.app";
