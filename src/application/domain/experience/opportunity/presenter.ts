import {
  GqlOpportunitiesConnection,
  GqlOpportunity,
  GqlOpportunityCreateSuccess,
  GqlOpportunityDeleteSuccess,
  GqlOpportunitySetPublishStatusSuccess,
  GqlOpportunityUpdateContentSuccess,
} from "@/types/graphql";
import { PrismaOpportunity } from "@/application/domain/experience/opportunity/data/type";
import PlacePresenter from "@/application/domain/location/place/presenter";
import UtilityPresenter from "@/application/domain/reward/utility/presenter";
import CommunityPresenter from "@/application/domain/account/community/presenter";
import UserPresenter from "@/application/domain/account/user/presenter";

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
    const {
      createdByUser,
      community,
      place,
      requiredUtilities,
      earliestReservableSlotView,
      images,
      ...prop
    } = r;

    return {
      ...prop,
      community: community ? CommunityPresenter.get(community) : null,
      place: place ? PlacePresenter.get(place) : null,
      createdByUser: createdByUser ? UserPresenter.get(createdByUser) : null,
      requiredUtilities: requiredUtilities.map(UtilityPresenter.get),
      earliestReservableSlotView,
      images: images.map((image) => image.url),
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
