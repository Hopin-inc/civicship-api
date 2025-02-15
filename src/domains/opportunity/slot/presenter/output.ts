import {
  GqlOpportunitySlot,
  GqlOpportunitySlotsBulkUpdateSuccess,
  GqlOpportunitySlotsConnection,
} from "@/types/graphql";
import { OpportunitySlotPayloadWithArgs } from "@/domains/opportunity/slot/type";
import OpportunityOutputFormat from "@/domains/opportunity/presenter/output";

export default class OpportunitySlotOutputFormat {
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

  static get(r: OpportunitySlotPayloadWithArgs): GqlOpportunitySlot {
    return {
      ...r,
      opportunity: r.opportunity ? OpportunityOutputFormat.get(r.opportunity) : null,
    };
  }

  static bulkUpdate(slots: GqlOpportunitySlot[]): GqlOpportunitySlotsBulkUpdateSuccess {
    return {
      __typename: "OpportunitySlotsBulkUpdateSuccess",
      slots,
    };
  }
}
