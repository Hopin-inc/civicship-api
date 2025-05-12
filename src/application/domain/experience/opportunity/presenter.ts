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
  static query(r: GqlOpportunity[], hasNextPage: boolean): GqlOpportunitiesConnection {
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

  static get(r: PrismaOpportunityDetail): GqlOpportunity {
    return r;
  }

  static create(r: PrismaOpportunityDetail): GqlOpportunityCreateSuccess {
    return {
      opportunity: this.get(r),
    };
  }

  static delete(r: PrismaOpportunityDetail): GqlOpportunityDeleteSuccess {
    return {
      opportunityId: r.id,
    };
  }

  static update(r: PrismaOpportunityDetail): GqlOpportunityUpdateContentSuccess {
    return {
      opportunity: this.get(r),
    };
  }

  static setPublishStatus(r: PrismaOpportunityDetail): GqlOpportunitySetPublishStatusSuccess {
    return {
      opportunity: this.get(r),
    };
  }
}
