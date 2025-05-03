import {
  GqlParticipationStatusHistoriesConnection,
  GqlParticipationStatusHistory,
} from "@/types/graphql";
import { PrismaParticipationStatusHistoryDetail } from "@/application/domain/experience/participation/statusHistory/data/type";

export default class ParticipationStatusHistoryPresenter {
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

  static get(r: PrismaParticipationStatusHistoryDetail): GqlParticipationStatusHistory {
    return {
      ...r,
      participation: null,
      createdByUser: null,
    };
  }
}
