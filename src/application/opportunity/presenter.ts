import {
  GqlOpportunitiesConnection,
  GqlOpportunity,
  GqlOpportunityCreateSuccess,
  GqlOpportunityDeleteSuccess,
  GqlOpportunityLogMyRecordSuccess,
  GqlOpportunitySetHostingStatusSuccess,
  GqlOpportunitySetPublishStatusSuccess,
  GqlOpportunityUpdateContentSuccess,
} from "@/types/graphql";
import {
  PrismaOpportunity,
  PrismaOpportunitySetHostingStatus,
} from "@/application/opportunity/data/type";
import PlacePresenter from "@/application/place/presenter";
import UtilityPresenter from "@/application/utility/presenter";
import CommunityPresenter from "@/application/community/presenter";

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

  static get(r: PrismaOpportunity): GqlOpportunity {
    const { createdByUser, community, place, requiredUtilities, ...prop } = r;

    return {
      ...prop,
      community: community ? CommunityPresenter.get(community) : null,
      place: place ? PlacePresenter.get(place) : null,
      createdByUser,
      requiredUtilities: requiredUtilities.map(UtilityPresenter.get),
    };
  }

  static log(r: PrismaOpportunity): GqlOpportunityLogMyRecordSuccess {
    return {
      __typename: "OpportunityLogMyRecordSuccess",
      opportunity: this.get(r),
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

  static setHostingStatus(
    r: PrismaOpportunitySetHostingStatus,
  ): GqlOpportunitySetHostingStatusSuccess {
    return {
      __typename: "OpportunitySetHostingStatusSuccess",
      opportunity: this.get(r),
    };
  }
}
