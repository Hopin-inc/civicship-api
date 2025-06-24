import { GqlVcIssuanceRequest, GqlVcIssuanceRequestsConnection } from "@/types/graphql";
import { PrismaVCIssuanceRequestDetail } from "@/application/domain/experience/evaluation/vcIssuanceRequest/data/type";

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
    };
  }
}
