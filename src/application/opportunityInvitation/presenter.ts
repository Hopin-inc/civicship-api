import {
  GqlOpportunityInvitation,
  GqlOpportunityInvitationsConnection,
  GqlOpportunityInvitationCreateSuccess,
  GqlOpportunityInvitationDisableSuccess,
} from "@/types/graphql";
import { PrismaOpportunityInvitation } from "@/application/opportunityInvitation/data/type";

export default class OpportunityInvitationPresenter {
  static query(
    r: GqlOpportunityInvitation[],
    hasNextPage: boolean,
  ): GqlOpportunityInvitationsConnection {
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

  static get(r: PrismaOpportunityInvitation): GqlOpportunityInvitation {
    return r;
  }

  static create(r: PrismaOpportunityInvitation): GqlOpportunityInvitationCreateSuccess {
    return {
      __typename: "OpportunityInvitationCreateSuccess",
      opportunityInvitation: this.get(r),
    };
  }

  static disable(r: PrismaOpportunityInvitation): GqlOpportunityInvitationDisableSuccess {
    return {
      __typename: "OpportunityInvitationDisableSuccess",
      opportunityInvitation: this.get(r),
    };
  }
}
