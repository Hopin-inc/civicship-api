import {
  GqlCommunitiesConnection,
  GqlCommunity,
  GqlCommunityCreateSuccess,
  GqlCommunityDeleteSuccess,
  GqlCommunityUpdateProfileSuccess,
} from "@/types/graphql";
import { CommunityPayloadWithArgs } from "@/domains/community/type";

export default class CommunityOutputFormat {
  static query(r: GqlCommunity[], hasNextPage: boolean): GqlCommunitiesConnection {
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

  static get(r: CommunityPayloadWithArgs): GqlCommunity {
    const { city, state, memberships, opportunities, participations, wallets, utility, ...prop } =
      r;

    return {
      ...prop,
      city: {
        ...city,
        state: city.state,
      },
      state: state || null,
      memberships: memberships?.map((m) => ({
        ...m,
        community: m.community,
        user: m.user,
      })),
      opportunities: opportunities?.map((o) => ({
        ...o,
        createdByUser: o.createdByUser,
        community: o.community,
        city: { ...o.city, state: o.city.state },
      })),
      participations: participations?.map((p) => ({
        ...p,
        user: p.user ? { ...p.user } : null,
        opportunity: p.opportunity
          ? {
              ...p.opportunity,
              createdBy: p.opportunity.createdByUser,
              city: { ...p.opportunity.city, state: p.opportunity.city.state },
              community: p.opportunity.community,
            }
          : null,
      })),
      wallets: wallets?.map((wallet) => ({
        ...wallet,
        user: wallet.user ? { ...wallet.user } : null,
        currentPointView: wallet.currentPointView
          ? {
              walletId: wallet.id,
              currentPoint: wallet.currentPointView.currentPoint,
            }
          : null,
      })),
      utilities: utility?.map((utility) => ({
        ...utility,
        community: utility.community,
      })),
    };
  }

  static create(r: CommunityPayloadWithArgs): GqlCommunityCreateSuccess {
    return {
      __typename: "CommunityCreateSuccess",
      community: this.get(r),
    };
  }

  static delete(r: CommunityPayloadWithArgs): GqlCommunityDeleteSuccess {
    return {
      __typename: "CommunityDeleteSuccess",
      communityId: r.id,
    };
  }

  static update(r: CommunityPayloadWithArgs): GqlCommunityUpdateProfileSuccess {
    return {
      __typename: "CommunityUpdateProfileSuccess",
      community: this.get(r),
    };
  }
}
