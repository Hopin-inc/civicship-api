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
import type { InclusionProof } from "@/application/domain/credential/vcIssuance/service";

/**
 * Wire shape for `GET /vc/:vcId/inclusion-proof` (§5.4.6).
 *
 * Mirrors the service-layer `InclusionProof` 1:1 today; declared here
 * separately so HTTP-shape changes (e.g. snake_case rename, additional
 * verification metadata) can land in this file without touching the
 * service contract.
 */
export interface InclusionProofResponse {
  vcId: string;
  vcJwt: string;
  vcAnchorId: string;
  rootHash: string;
  chainTxHash: string;
  proofPath: string[];
  leafIndex: number;
  blockHeight: number | null;
}

/**
 * Map the persistence-layer status (Prisma `VcIssuanceStatus`) to the
 * GraphQL enum. The Prisma enum currently lacks `IN_PROGRESS` (it stops
 * at `PROCESSING` for legacy reasons); we translate `PROCESSING` →
 * `IN_PROGRESS` so the GraphQL schema can stay free of the legacy
 * spelling. Defensive default keeps the presenter total over the row
 * union as it widens.
 */
function toGqlStatus(status: VcIssuanceRow["status"]): GqlVcIssuance["status"] {
  switch (status) {
    case "PENDING":
      return "PENDING";
    case "PROCESSING":
      return "IN_PROGRESS";
    case "COMPLETED":
      return "COMPLETED";
    case "FAILED":
      return "FAILED";
    case "REVOKED":
      // Phase 1.5 schema PR: Prisma 側に `REVOKED` を追加した時点では GraphQL
      // 列挙はまだ更新しない。実際の `REVOKED` 書込みは後続の
      // `feat/did-revoke-mutation` PR で行い、その PR で GraphQL enum 拡張
      // と `revokedAt` の参照経路を整える。それまでは presenter が新しい
      // Prisma 値を受け取った場合に備えて防御的に COMPLETED に丸める
      // (revoke 後でも VC 本体の発行ライフサイクルは終了しているため)。
      return "COMPLETED";
    default: {
      // Exhaustiveness guard — if a new state is added to the row union
      // and nothing here handles it, TypeScript flags this branch.
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

/**
 * Map the persistence-layer format (Prisma `VcFormat`) to the GraphQL
 * enum. The two enums diverge on the legacy IDENTUS spelling: Prisma uses
 * `IDENTUS_JWT` while the GraphQL schema exposes the historical
 * `IDENTUS_VC_PRISM` value. Phase 1 only emits `INTERNAL_JWT` so this
 * mostly matters for legacy-compat reads.
 */
function toGqlFormat(format: VcIssuanceRow["vcFormat"]): GqlVcIssuance["vcFormat"] {
  switch (format) {
    case "INTERNAL_JWT":
      return "INTERNAL_JWT";
    case "IDENTUS_JWT":
      return "IDENTUS_VC_PRISM";
    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }
}

const VcIssuancePresenter = {
  view(row: VcIssuanceRow): GqlVcIssuance {
    return {
      __typename: "VcIssuance",
      id: row.id,
      userId: row.userId,
      evaluationId: row.evaluationId,
      // The GraphQL schema declares `issuerDid` / `subjectDid` as `String!`
      // (non-nullable) — the row may carry `null` when the underlying JWT
      // payload was missing/corrupt and the repository could not decode it.
      // We coalesce to `""` so the GraphQL surface stays type-stable; the
      // empty string is a clear sentinel for "decode failed".
      issuerDid: row.issuerDid ?? "",
      subjectDid: row.subjectDid ?? "",
      vcFormat: toGqlFormat(row.vcFormat),
      vcJwt: row.vcJwt,
      status: toGqlStatus(row.status),
      statusListIndex: row.statusListIndex,
      statusListCredential: row.statusListCredential,
      revokedAt: row.revokedAt,
      createdAt: row.createdAt,
    };
  },

  /**
   * §5.4.6 — wire shape for the `/vc/:vcId/inclusion-proof` endpoint.
   *
   * The transformation is a pure passthrough today; kept as a presenter
   * call so future schema migrations (e.g. snake_case for HTTP) do not
   * leak into the service.
   */
  toInclusionProofResponse(proof: InclusionProof): InclusionProofResponse {
    return {
      vcId: proof.vcId,
      vcJwt: proof.vcJwt,
      vcAnchorId: proof.vcAnchorId,
      rootHash: proof.rootHash,
      chainTxHash: proof.chainTxHash,
      proofPath: proof.proofPath,
      leafIndex: proof.leafIndex,
      blockHeight: proof.blockHeight,
    };
  },
};

export default VcIssuancePresenter;
