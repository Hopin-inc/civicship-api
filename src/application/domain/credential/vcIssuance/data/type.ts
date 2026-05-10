/**
 * Local type declarations for the `credential/vcIssuance` application
 * domain.
 *
 * `VcIssuanceRow` is the application-layer view of a VC issuance request.
 * It exposes `issuerDid` / `subjectDid` for downstream consumers even
 * though the underlying `t_vc_issuance_requests` Prisma model does not
 * persist them as columns — the canonical source is the JWT payload, which
 * the repository round-trips on read (see `decodeIssuerSubjectFromJwt` in
 * `data/repository.ts`).
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §4.1   (VcIssuanceRequest schema)
 *   docs/report/did-vc-internalization.md §5.2.2 (Application service shape)
 *   docs/report/did-vc-internalization.md §D     (credentialStatus)
 */

import type { VcFormat, VcIssuanceStatus } from "@prisma/client";

/**
 * §4.1 — VC format. Phase 1 only emits `INTERNAL_JWT`. Aliased to the
 * Prisma `VcFormat` enum so widening (e.g. when new variants land in the
 * schema) is automatic.
 */
export type VcFormatValue = VcFormat;

/**
 * §4.1 — VC lifecycle status. Aliased to the Prisma `VcIssuanceStatus`
 * enum so the application layer always speaks the persisted vocabulary
 * (`PENDING` / `IN_PROGRESS` / `PROCESSING` / `COMPLETED` / `FAILED`).
 */
export type VcStatusValue = VcIssuanceStatus;

/**
 * Application-layer view of a VC issuance row. The fields below mirror
 * the columns the service writes, plus the JWT-payload-derived
 * `issuerDid` / `subjectDid` accessors.
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
   * Revocation timestamp.
   *
   * In Phase 1 (this PR / step 7+8) revocation is not yet wired: the
   * StatusList domain that flips revocation bits and stamps this column
   * lands in Phase 1 step 9. Until that step ships this field is
   * **always `null`** — the schema column exists so the read path is
   * stable, but no code path writes to it.
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
