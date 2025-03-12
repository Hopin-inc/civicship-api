import {
  GqlOpportunityInvitationHistory,
  GqlOpportunityInvitationHistoriesConnection,
} from "@/types/graphql";
import { PrismaInvitationHistory } from "@/application/opportunityInvitation/invitationHistory/data/type";
import OpportunityInvitationPresenter from "@/application/opportunityInvitation/presenter";

export default class OpportunityInvitationHistoryPresenter {
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

  static get(r: PrismaInvitationHistory): GqlOpportunityInvitationHistory {
    const { invitedUser, invitation, ...prop } = r;

    return {
      ...prop,
      invitedUser,
      invitation: OpportunityInvitationPresenter.get(invitation),
    };
  }
}
