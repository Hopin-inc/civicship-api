import {
  GqlOpportunitiesConnection,
  GqlOpportunity,
  GqlOpportunityCreateSuccess,
} from "@/types/graphql";
import { OpportunityPayloadWithArgs } from "@/domains/opportunity/type";

export default class OpportunityOutputFormat {
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

  static get(r: OpportunityPayloadWithArgs): GqlOpportunity {
    const { createdByUser, participations, community, city, ...prop } = r;

    return {
      ...prop,
      community: community,
      city: city,
      createdBy: createdByUser,
      participations: participations?.map((p) => ({
        ...p,
        user: p.user ? { ...p.user } : null,
      })),
    };
  }

  static create(r: OpportunityPayloadWithArgs): GqlOpportunityCreateSuccess {
    return {
      __typename: "OpportunityCreateSuccess",
      opportunity: this.get(r),
    };
  }
}
