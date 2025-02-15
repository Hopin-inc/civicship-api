import {
  GqlOpportunityInvitationHistory,
  GqlOpportunityInvitationHistoriesConnection,
} from "@/types/graphql";
import { InvitationHistoryPayloadWithArgs } from "@/domains/opportunity/invitation/history/type";

export default class OpportunityInvitationHistoryOutputFormat {
  static query(
    list: GqlOpportunityInvitationHistory[],
    hasNextPage: boolean,
  ): GqlOpportunityInvitationHistoriesConnection {
    return {
      totalCount: list.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: list[0]?.id,
        endCursor: list.length ? list[list.length - 1].id : undefined,
      },
      edges: list.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(r: InvitationHistoryPayloadWithArgs): GqlOpportunityInvitationHistory {
    return {
      ...r,
    };
  }
}
