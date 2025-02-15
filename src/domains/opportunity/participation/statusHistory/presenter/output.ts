import {
  GqlParticipationStatusHistoriesConnection,
  GqlParticipationStatusHistory,
} from "@/types/graphql";
import { ParticipationStatusHistoryPayloadWithArgs } from "@/domains/opportunity/participation/statusHistory/type";

export default class ParticipationStatusHistoryOutputFormat {
  static query(
    r: GqlParticipationStatusHistory[],
    hasNextPage: boolean,
  ): GqlParticipationStatusHistoriesConnection {
    return {
      totalCount: r.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: r[0]?.id,
        endCursor: r.length ? r[r.length - 1].id : undefined,
      },
      edges: r.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(r: ParticipationStatusHistoryPayloadWithArgs): GqlParticipationStatusHistory {
    const { createdByUser, participation } = r;

    return {
      ...r,
      participation,
      createdByUser,
    };
  }
}
