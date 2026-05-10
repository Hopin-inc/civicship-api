/**
 * `VcIssuancePresenter` — Prisma row → GraphQL type formatting for the
 * VC issuance domain.
 *
 * Phase 1 step 8 scope: GraphQL schema (`VcIssuance`) lands in this PR,
 * so the presenter now produces `GqlVcIssuance`. Strategy A still
 * applies: the input row is the local `VcIssuanceRow`, which the cleanup
 * PR (`claude/phase1-strategy-a-cleanup`) will replace with the
 * Prisma-generated `VcIssuanceRequest` model in one move. Field names
 * line up so the swap is mechanical.
 *
 * Note: `vcAnchorId` / `anchorLeafIndex` / `completedAt` are not yet
 * exposed by the GraphQL `VcIssuance` type (they belong to the anchor /
 * batch view added in Phase 1 step 9+). The fields stay on the row so
 * the persistence layer can populate them and a future schema extension
 * can pick them up without another migration.
 *
 * Pure functions only — no I/O, no DI, no business logic (per CLAUDE.md
 * "Layer Responsibilities" §6).
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.2
 *   docs/report/did-vc-internalization.md §4.1
 */

import type { GqlVcIssuance } from "@/types/graphql";
import type { VcIssuanceRow } from "@/application/domain/credential/vcIssuance/data/type";

/**
 * Map the persistence-layer status to the GraphQL enum. Legacy
 * `PROCESSING` rows surface as `IN_PROGRESS` so the GraphQL schema can
 * stay free of the legacy spelling. Defensive default keeps the
 * presenter total over the row union.
 */
function toGqlStatus(status: VcIssuanceRow["status"]): GqlVcIssuance["status"] {
  switch (status) {
    case "PENDING":
      return "PENDING";
    case "IN_PROGRESS":
    case "PROCESSING":
      return "IN_PROGRESS";
    case "COMPLETED":
      return "COMPLETED";
    case "FAILED":
      return "FAILED";
    default: {
      // Exhaustiveness guard — if a new state is added to the row union
      // and nothing here handles it, TypeScript flags this branch.
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

/**
 * Map the persistence-layer format to the GraphQL enum. The VC format
 * union is intentionally narrow (Phase 1 only emits `INTERNAL_JWT`); the
 * legacy `IDENTUS_VC_PRISM` value passes through unchanged.
 */
function toGqlFormat(format: VcIssuanceRow["vcFormat"]): GqlVcIssuance["vcFormat"] {
  return format;
}

const VcIssuancePresenter = {
  view(row: VcIssuanceRow): GqlVcIssuance {
    return {
      __typename: "VcIssuance",
      id: row.id,
      userId: row.userId,
      evaluationId: row.evaluationId,
      issuerDid: row.issuerDid,
      subjectDid: row.subjectDid,
      vcFormat: toGqlFormat(row.vcFormat),
      vcJwt: row.vcJwt,
      status: toGqlStatus(row.status),
      statusListIndex: row.statusListIndex,
      statusListCredential: row.statusListCredential,
      revokedAt: row.revokedAt,
      createdAt: row.createdAt,
    };
  },
};

export default VcIssuancePresenter;
