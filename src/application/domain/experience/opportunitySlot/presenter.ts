import {
  GqlOpportunitySlot,
  GqlOpportunitySlotsBulkUpdateSuccess,
  GqlOpportunitySlotsConnection,
  GqlOpportunitySlotSetHostingStatusSuccess,
} from "@/types/graphql";
import {
  PrismaOpportunitySlotDetail,
  PrismaOpportunitySlotSetHostingStatus,
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

  static get(r: PrismaOpportunitySlotDetail): GqlOpportunitySlot {
    const { remainingCapacityView, ...prop } = r;
    return {
      ...prop,
      remainingCapacity: remainingCapacityView ? remainingCapacityView.remainingCapacity : null,
    };
  }

  static setHostingStatus(
    r: Omit<PrismaOpportunitySlotSetHostingStatus, "reservations" | "opportunity">,
  ): GqlOpportunitySlotSetHostingStatusSuccess {
    return { slot: { ...r } };
  }

  static bulkUpdate(slots: GqlOpportunitySlot[]): GqlOpportunitySlotsBulkUpdateSuccess {
    return { slots };
  }
}
