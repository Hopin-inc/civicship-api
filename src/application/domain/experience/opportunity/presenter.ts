import {
  GqlOpportunitiesConnection,
  GqlOpportunity,
  GqlOpportunityCreateSuccess,
  GqlOpportunityDeleteSuccess,
  GqlOpportunitySetPublishStatusSuccess,
  GqlOpportunityUpdateContentSuccess,
} from "@/types/graphql";
import { PrismaOpportunityDetail } from "@/application/domain/experience/opportunity/data/type";

export default class OpportunityPresenter {
  static query(r: GqlOpportunity[], hasNextPage: boolean, cursor?: string): GqlOpportunitiesConnection {
    return {
      __typename: "OpportunitiesConnection",
      totalCount: r.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        startCursor: r[0]?.id,
        endCursor: r.length ? r[r.length - 1].id : undefined,
      },
      edges: r.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(r: PrismaOpportunityDetail): GqlOpportunity {
    return {
      __typename: "Opportunity",
      ...r,
    };
  }

  static create(r: PrismaOpportunityDetail): GqlOpportunityCreateSuccess {
    return {
      __typename: "OpportunityCreateSuccess",
      opportunity: this.get(r),
    };
  }

  static delete(r: PrismaOpportunityDetail): GqlOpportunityDeleteSuccess {
    return {
      __typename: "OpportunityDeleteSuccess",
      opportunityId: r.id,
    };
  }

  static update(r: PrismaOpportunityDetail): GqlOpportunityUpdateContentSuccess {
    return {
      __typename: "OpportunityUpdateContentSuccess",
      opportunity: this.get(r),
    };
  }

  static setPublishStatus(r: PrismaOpportunityDetail): GqlOpportunitySetPublishStatusSuccess {
    return {
      __typename: "OpportunitySetPublishStatusSuccess",
      opportunity: this.get(r),
    };
  }
}
