import {
  GqlOpportunityInvitation,
  GqlOpportunityInvitationsConnection,
  GqlOpportunityInvitationCreateSuccess,
  GqlOpportunityInvitationDisableSuccess,
  GqlOpportunityInvitationDeleteSuccess,
} from "@/types/graphql";
import { OpportunityInvitationPayloadWithArgs } from "@/infra/prisma/types/opportunity/invitation";

export default class OpportunityInvitationOutputFormat {
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

  static get(r: OpportunityInvitationPayloadWithArgs): GqlOpportunityInvitation {
    return {
      ...r,
    };
  }

  static create(r: OpportunityInvitationPayloadWithArgs): GqlOpportunityInvitationCreateSuccess {
    return {
      __typename: "OpportunityInvitationCreateSuccess",
      opportunityInvitation: this.get(r),
    };
  }

  static disable(r: OpportunityInvitationPayloadWithArgs): GqlOpportunityInvitationDisableSuccess {
    return {
      __typename: "OpportunityInvitationDisableSuccess",
      opportunityInvitation: this.get(r),
    };
  }

  static delete(r: OpportunityInvitationPayloadWithArgs): GqlOpportunityInvitationDeleteSuccess {
    return {
      __typename: "OpportunityInvitationDeleteSuccess",
      id: r.id,
    };
  }
}
