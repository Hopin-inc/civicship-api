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
      __typename: "OpportunitySlotsConnection",
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
      __typename: "OpportunitySlot",
      ...prop,
      remainingCapacity: remainingCapacityView ? remainingCapacityView.remainingCapacity : null,
    };
  }

  static setHostingStatus(
    r: Omit<PrismaOpportunitySlotSetHostingStatus, "reservations" | "opportunity">,
  ): GqlOpportunitySlotSetHostingStatusSuccess {
    return {
      __typename: "OpportunitySlotSetHostingStatusSuccess",
      slot: { 
        ...r,
        isFullyEvaluated: false, // デフォルト値を設定
        numEvaluated: 0,         // デフォルト値を設定
        numParticipants: 0,      // デフォルト値を設定
      },
    };
  }

  static bulkUpdate(slots: GqlOpportunitySlot[]): GqlOpportunitySlotsBulkUpdateSuccess {
    return {
      __typename: "OpportunitySlotsBulkUpdateSuccess",
      slots,
    };
  }
}
