import {
  GqlOpportunitiesConnection,
  GqlOpportunity,
  GqlOpportunityCreateSuccess,
  GqlOpportunityDeleteSuccess,
  GqlOpportunitySetPublishStatusSuccess,
  GqlOpportunityUpdateContentSuccess,
} from "@/types/graphql";
import { OpportunityPayloadWithArgs } from "@/infra/prisma/types/opportunity";
import PlaceOutputFormat from "@/presentation/graphql/dto/place/output";

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
    const { createdByUser, community, place, ...prop } = r;

    return {
      ...prop,
      community,
      place: place ? PlaceOutputFormat.get(place) : null,
      createdByUser,
    };
  }

  static create(r: OpportunityPayloadWithArgs): GqlOpportunityCreateSuccess {
    return {
      __typename: "OpportunityCreateSuccess",
      opportunity: this.get(r),
    };
  }

  static delete(r: OpportunityPayloadWithArgs): GqlOpportunityDeleteSuccess {
    return {
      __typename: "OpportunityDeleteSuccess",
      opportunityId: r.id,
    };
  }

  static update(r: OpportunityPayloadWithArgs): GqlOpportunityUpdateContentSuccess {
    return {
      __typename: "OpportunityUpdateContentSuccess",
      opportunity: this.get(r),
    };
  }

  static setPublishStatus(r: OpportunityPayloadWithArgs): GqlOpportunitySetPublishStatusSuccess {
    return {
      __typename: "OpportunitySetPublishStatusSuccess",
      opportunity: this.get(r),
    };
  }
}
