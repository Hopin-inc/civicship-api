/**
 * Local type declarations for the `credential/vcIssuance` application
 * domain.
 *
 * Strategy A note (Phase 1 step 7) ----------------------------------------
 *
 * The schema PR (#1094) introduces a new `t_vc_issuance_requests` Prisma
 * model that supersedes the existing IDENTUS-era `vcIssuanceRequest` model
 * with a JWT-shaped column set (vcJwt / vcAnchorId / anchorLeafIndex /
 * statusListIndex / statusListCredential). To keep this PR independent we
 * declare the row shape locally as `VcIssuanceRow` — it intentionally
 * mirrors the design's column set so that, after the schema PR merges,
 * swapping to the generated type is a one-line change:
 *
 *     // TODO(phase1-final): replace with
 *     //   import type { VcIssuanceRequest } from "@prisma/client";
 *     //   export type VcIssuanceRow = VcIssuanceRequest;
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §4.1   (VcIssuanceRequest schema)
 *   docs/report/did-vc-internalization.md §5.2.2 (Application service shape)
 *   docs/report/did-vc-internalization.md §D     (credentialStatus)
 */

/**
 * §4.1 — VC format. Phase 1 only emits `INTERNAL_JWT`; `IDENTUS_VC_PRISM`
 * is retained as a value for legacy compatibility (the GraphQL schema
 * exposes the same values).
 */
export type VcFormatValue = "INTERNAL_JWT" | "IDENTUS_VC_PRISM";

/**
 * §4.1 — VC lifecycle status.
 *
 * The values mirror `GqlVcIssuanceStatus`. The legacy `VcIssuanceRequest`
 * model still uses `PROCESSING` so we keep it in the union; new VCs only
 * transition through `PENDING → IN_PROGRESS → COMPLETED / FAILED`.
 */
export type VcStatusValue = "PENDING" | "IN_PROGRESS" | "PROCESSING" | "COMPLETED" | "FAILED";

/**
 * Local row shape standing in for `VcIssuanceRequest` post-schema-PR.
 *
 * Fields match the design's schema (§4.1) one-for-one. The legacy IDENTUS
 * fields (`jobId`, `errorMessage`, `retryCount`, …) are intentionally
 * omitted — Phase 1 step 7 only needs the columns this service writes.
 */
export interface VcIssuanceRow {
  id: string;
  userId: string;
  evaluationId: string | null;
  issuerDid: string;
  subjectDid: string;
  vcFormat: VcFormatValue;
  vcJwt: string;
  statusListIndex: number | null;
  statusListCredential: string | null;
  vcAnchorId: string | null;
  anchorLeafIndex: number | null;
  status: VcStatusValue;
  createdAt: Date;
  completedAt: Date | null;
  /**
   * Set non-null when the VC has been revoked via the StatusList domain
   * (Phase 1 step 9). Until then this is always null.
   */
  revokedAt: Date | null;
}

/**
 * Inputs to `VcIssuanceService.issueVc`. Mirrors §5.2.2 example with the
 * `issuerDid` defaulted in the service (always
 * `did:web:api.civicship.app` per Phase 1 design).
 */
export interface IssueVcInput {
  userId: string;
  /** Optional — set when the VC is tied to an Evaluation (typical case). */
  evaluationId?: string;
  /** The user's `did:web:api.civicship.app:users:<id>` per §B. */
  subjectDid: string;
  /** Free-form claim payload — opaque to this service, signed by KMS. */
  claims: Record<string, unknown>;
  /**
   * Issuance timestamp injected by the caller. Optional — defaults to
   * `new Date()` inside the service. Exposed so that:
   *   1. tests can pin the timestamp for deterministic JWT/snapshot assertions
   *   2. batch / replay flows can preserve the original VC issuance time
   *      instead of stamping the moment of replay.
   *
   * The same instance is used for both the W3C `issuanceDate` claim and the
   * persistence row, eliminating sub-second drift between the two.
   */
  issuedAt?: Date;
}

/** Inputs to `IVcIssuanceRepository.create`. */
export interface CreateVcIssuanceInput {
  userId: string;
  evaluationId?: string | null;
  issuerDid: string;
  subjectDid: string;
  vcFormat: VcFormatValue;
  vcJwt: string;
  statusListIndex?: number | null;
  statusListCredential?: string | null;
  status: VcStatusValue;
}
