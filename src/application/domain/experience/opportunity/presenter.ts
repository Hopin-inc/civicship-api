import {
  GqlOpportunitiesConnection,
  GqlOpportunity,
  GqlOpportunityCreateSuccess,
  GqlOpportunityDeleteSuccess,
  GqlOpportunitySetPublishStatusSuccess,
  GqlOpportunityUpdateContentSuccess,
} from "@/types/graphql";
import { PrismaOpportunity, PrismaOpportunityDetail } from "@/application/domain/experience/opportunity/data/type";

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

  static get(r: PrismaOpportunity | PrismaOpportunityDetail): GqlOpportunity {
    const images = 'images' in r && r.images ? 
      (Array.isArray(r.images) ? r.images.map(img => typeof img === 'object' && 'url' in img ? img.url : '') : []) : 
      [];
    
    const earliestReservableSlotView = 'earliestReservableSlotView' in r ? r.earliestReservableSlotView : null;
    
    return {
      ...r,
      title: 'title' in r ? r.title : '',
      category: "ACTIVITY", // Default category
      requireApproval: 'requireApproval' in r ? r.requireApproval : false,
      community: null,
      place: null,
      createdByUser: null,
      requiredUtilities: [],
      earliestReservableSlotView,
      images,
      articles: null,
      body: 'body' in r ? r.body : null,
      feeRequired: 'feeRequired' in r ? r.feeRequired : null,
      isReservableWithTicket: null,
      pointsToEarn: 'pointsToEarn' in r ? r.pointsToEarn : null,
      slots: null
    };
  }

  static create(r: PrismaOpportunity): GqlOpportunityCreateSuccess {
    return {
      __typename: "OpportunityCreateSuccess",
      opportunity: this.get(r),
    };
  }

  static delete(r: PrismaOpportunity): GqlOpportunityDeleteSuccess {
    return {
      __typename: "OpportunityDeleteSuccess",
      opportunityId: r.id,
    };
  }

  static update(r: PrismaOpportunity): GqlOpportunityUpdateContentSuccess {
    return {
      __typename: "OpportunityUpdateContentSuccess",
      opportunity: this.get(r),
    };
  }

  static setPublishStatus(r: PrismaOpportunity): GqlOpportunitySetPublishStatusSuccess {
    return {
      __typename: "OpportunitySetPublishStatusSuccess",
      opportunity: this.get(r),
    };
  }
}
