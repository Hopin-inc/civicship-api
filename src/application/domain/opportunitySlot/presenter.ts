import {
  GqlOpportunitySlot,
  GqlOpportunitySlotsBulkUpdateSuccess,
  GqlOpportunitySlotsConnection,
  GqlOpportunitySlotSetHostingStatusSuccess,
} from "@/types/graphql";
import {
  PrismaOpportunitySlot,
  PrismaOpportunitySlotWithParticipation,
} from "@/application/domain/opportunitySlot/data/type";

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

  static get(r: PrismaOpportunitySlot): GqlOpportunitySlot {
    const { opportunity, remainingCapacityView, ...prop } = r;

    return {
      ...prop,
      opportunity: opportunity ? opportunity : null,
      remainingCapacityView:
        OpportunitySlotPresenter.formatRemainingCapacityView(remainingCapacityView),
    };
  }

  static setHostingStatus(
    r: PrismaOpportunitySlotWithParticipation,
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
