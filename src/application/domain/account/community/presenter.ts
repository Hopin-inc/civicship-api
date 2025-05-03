import {
  GqlCommunitiesConnection,
  GqlCommunity,
  GqlCommunityCreateSuccess,
  GqlCommunityDeleteSuccess,
  GqlCommunityUpdateProfileSuccess,
} from "@/types/graphql";
import { PrismaCommunity, PrismaCommunityDetail } from "@/application/domain/account/community/data/type";

export default class CommunityPresenter {
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

  static get(r: PrismaCommunityDetail): GqlCommunity {
    return {
      id: r.id,
      name: r.name,
      bio: r.bio,
      createdAt: r.createdAt,
      image: null,
      places: null,
      memberships: null,
      opportunities: null,
      participations: null,
      articles: null,
      utilities: null,
      wallets: null,
    };
  }

  static create(r: PrismaCommunity): GqlCommunityCreateSuccess {
    return {
      __typename: "CommunityCreateSuccess",
      community: this.get(r),
    };
  }

  static delete(r: PrismaCommunity): GqlCommunityDeleteSuccess {
    return {
      __typename: "CommunityDeleteSuccess",
      communityId: r.id,
    };
  }

  static update(r: PrismaCommunity): GqlCommunityUpdateProfileSuccess {
    return {
      __typename: "CommunityUpdateProfileSuccess",
      community: this.get(r),
    };
  }
}
