import {
  GqlOpportunitySlot,
  GqlOpportunitySlotsBulkUpdateSuccess,
  GqlOpportunitySlotsConnection,
  GqlOpportunitySlotSetHostingStatusSuccess,
} from "@/types/graphql";
import {
  PrismaOpportunitySlot,
  PrismaOpportunitySlotWithParticipation,
  PrismaOpportunitySlotDetail,
  PrismaOpportunitySlotWithParticipationDetail
} from "@/application/domain/experience/opportunitySlot/data/type";

export default class OpportunitySlotPresenter {
  static query(r: GqlOpportunitySlot[], hasNextPage: boolean): GqlOpportunitySlotsConnection {
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

  static get(r: PrismaOpportunitySlot | PrismaOpportunitySlotDetail): GqlOpportunitySlot {
    return {
      ...r,
      startsAt: r.startAt,
      endsAt: r.endAt,
      opportunity: null,
      participations: null,
      reservations: null,
      remainingCapacityView:
        OpportunitySlotPresenter.formatRemainingCapacityView(r.remainingCapacityView),
    };
  }

  static setHostingStatus(
    r: PrismaOpportunitySlotWithParticipation | PrismaOpportunitySlotWithParticipationDetail,
  ): GqlOpportunitySlotSetHostingStatusSuccess {
    return {
      __typename: "OpportunitySlotSetHostingStatusSuccess",
      slot: this.get(r),
    };
  }

  static bulkUpdate(slots: GqlOpportunitySlot[]): GqlOpportunitySlotsBulkUpdateSuccess {
    return {
      __typename: "OpportunitySlotsBulkUpdateSuccess",
      slots,
    };
  }

  private static formatRemainingCapacityView(
    view?: PrismaOpportunitySlot["remainingCapacityView"],
  ): GqlOpportunitySlot["remainingCapacityView"] {
    return view
      ? {
          opportunitySlotId: view.slotId,
          remainingCapacity: view.remainingCapacity,
        }
      : null;
  }
}
