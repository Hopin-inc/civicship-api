/**
 * `VcIssuancePresenter` — Prisma row → GraphQL type formatting for the
 * VC issuance domain.
 *
 * Phase 1 step 7 scope: skeleton only. Once the GraphQL schema PR (Phase
 * 1 step 8) introduces `GqlVcIssuance`, swap the return type to that and
 * tighten the shape. Pure functions only — no I/O, no DI, no business
 * logic (per CLAUDE.md "Layer Responsibilities" §6).
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.2
 */

import type { VcIssuanceRow } from "@/application/domain/credential/vcIssuance/data/type";

export interface VcIssuanceView {
  id: string;
  userId: string;
  evaluationId: string | null;
  issuerDid: string;
  subjectDid: string;
  vcFormat: VcIssuanceRow["vcFormat"];
  vcJwt: string;
  statusListIndex: number | null;
  statusListCredential: string | null;
  vcAnchorId: string | null;
  anchorLeafIndex: number | null;
  status: VcIssuanceRow["status"];
  createdAt: string;
  completedAt: string | null;
}

const VcIssuancePresenter = {
  view(row: VcIssuanceRow): VcIssuanceView {
    return {
      id: row.id,
      userId: row.userId,
      evaluationId: row.evaluationId,
      issuerDid: row.issuerDid,
      subjectDid: row.subjectDid,
      vcFormat: row.vcFormat,
      vcJwt: row.vcJwt,
      statusListIndex: row.statusListIndex,
      statusListCredential: row.statusListCredential,
      vcAnchorId: row.vcAnchorId,
      anchorLeafIndex: row.anchorLeafIndex,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    };
  },
};

export default VcIssuancePresenter;
