import {
  GqlOpportunitySlot,
  GqlOpportunitySlotsBulkUpdateSuccess,
  GqlOpportunitySlotsConnection,
  GqlOpportunitySlotSetHostingStatusSuccess,
} from "@/types/graphql";
import {
  PrismaOpportunitySlotDetail,
  PrismaOpportunitySlotWithParticipationDetail,
} from "@/application/domain/experience/opportunitySlot/data/type";

export default class OpportunitySlotPresenter {
  static query(
    r: PrismaOpportunitySlotDetail[],
    hasNextPage: boolean,
  ): GqlOpportunitySlotsConnection {
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

  static get(r: PrismaOpportunitySlotDetail): GqlOpportunitySlot {
    const { remainingCapacityView, ...prop } = r;
    return {
      ...prop,
      remainingCapacity: remainingCapacityView ? remainingCapacityView.remainingCapacity : null,
      reservations: [],
    };
  }

  static setHostingStatus(
    r: PrismaOpportunitySlotWithParticipationDetail,
  ): GqlOpportunitySlotSetHostingStatusSuccess {
    return {
      slot: this.get(r),
    };
  }

  static bulkUpdate(slots: PrismaOpportunitySlotDetail[]): GqlOpportunitySlotsBulkUpdateSuccess {
    return {
      slots,
    };
  }
}
