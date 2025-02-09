import {
  GqlOpportunitiesConnection,
  GqlOpportunity,
  GqlOpportunityCreateSuccess,
  GqlOpportunityDeleteSuccess,
  GqlOpportunityEditContentSuccess,
  GqlOpportunitySetPublishStatusSuccess,
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
      community: {
        ...community,
        wallets: community.wallets?.map((wallet) => ({
          ...wallet,
          community: {
            ...wallet.community,
            city: { ...wallet.community.city, state: wallet.community.city.state },
          },
          user: wallet.user ? { ...wallet.user } : null,
          currentPointView: wallet.currentPointView
            ? {
                walletId: wallet.id,
                currentPoint: wallet.currentPointView.currentPoint,
              }
            : null,
        })),
      },
      city: {
        ...city,
        state: city.state,
      },
      createdByUser,
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

  static delete(r: OpportunityPayloadWithArgs): GqlOpportunityDeleteSuccess {
    return {
      __typename: "OpportunityDeleteSuccess",
      opportunityId: r.id,
    };
  }

  static update(r: OpportunityPayloadWithArgs): GqlOpportunityEditContentSuccess {
    return {
      __typename: "OpportunityEditContentSuccess",
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
