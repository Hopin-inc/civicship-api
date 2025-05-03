import { GqlTicketStatusHistory, GqlTicketStatusHistoriesConnection } from "@/types/graphql";
import { PrismaTicketStatusHistoryDetail } from "@/application/domain/reward/ticket/statusHistory/data/type";

export default class TicketStatusHistoryPresenter {
  static query(
    histories: GqlTicketStatusHistory[],
    hasNextPage: boolean,
  ): GqlTicketStatusHistoriesConnection {
    return {
      totalCount: histories.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: histories[0]?.id,
        endCursor: histories.length ? histories[histories.length - 1].id : undefined,
      },
      edges: histories.map((history) => ({
        cursor: history.id,
        node: history,
      })),
    };
  }

  static get(r: PrismaTicketStatusHistoryDetail): GqlTicketStatusHistory {
    return {
      ...r,
      ticket: null,
      createdByUser: null,
      transaction: null,
    };
  }
}
