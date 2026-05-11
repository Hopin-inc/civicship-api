import {
  GqlVcIssuanceRequest,
  GqlVcIssuanceRequestsConnection,
  GqlVcIssuanceStatus,
} from "@/types/graphql";
import { PrismaVCIssuanceRequestDetail } from "@/application/domain/experience/evaluation/vcIssuanceRequest/data/type";

/**
 * Phase 1.5 schema PR で Prisma `VcIssuanceStatus` に `REVOKED` を追加したが、
 * GraphQL 側の `VcIssuanceStatus` enum はまだ拡張しない (後続の
 * `feat/did-revoke-mutation` PR で対応)。Prisma → GraphQL の status
 * マッピングをここで吸収する。`REVOKED` は終端 failure-like 状態として
 * 暫定的に `FAILED` に丸める (revoke 後の issuance request は再利用しない)。
 */
function toGqlStatus(status: PrismaVCIssuanceRequestDetail["status"]): GqlVcIssuanceStatus {
  switch (status) {
    case "PENDING":
      return "PENDING";
    case "PROCESSING":
      return "PROCESSING";
    case "COMPLETED":
      return "COMPLETED";
    case "FAILED":
      return "FAILED";
    case "REVOKED":
      return "FAILED";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export default class VCIssuanceRequestPresenter {
  static query(
    records: GqlVcIssuanceRequest[],
    hasNextPage: boolean,
  ): GqlVcIssuanceRequestsConnection {
    return {
      __typename: "VcIssuanceRequestsConnection",
      totalCount: records.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: records[0]?.id,
        endCursor: records.length ? records[records.length - 1].id : undefined,
      },
      edges: records.map((record) => ({
        cursor: record.id,
        node: record,
      })),
    };
  }

  static get(record: PrismaVCIssuanceRequestDetail): GqlVcIssuanceRequest {
    return {
      __typename: "VcIssuanceRequest",
      ...record,
      status: toGqlStatus(record.status),
    };
  }
}
