import {
  GqlCommunitiesConnection,
  GqlCommunity,
  GqlCommunityCreateSuccess,
  GqlCommunityDeleteSuccess,
  GqlCommunityUpdateProfileSuccess,
} from "@/types/graphql";
import { PrismaCommunityDetail } from "@/application/domain/account/community/data/type";

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
      ...r,
      memberships: [],
      wallets: [],

      opportunities: [],
      places: [],
      participations: [],
      utilities: [],

      articles: [],
    };
  }

  static create(r: PrismaCommunityDetail): GqlCommunityCreateSuccess {
    return {
      community: this.get(r),
    };
  }

  static delete(r: PrismaCommunityDetail): GqlCommunityDeleteSuccess {
    return {
      communityId: r.id,
    };
  }

  static update(r: PrismaCommunityDetail): GqlCommunityUpdateProfileSuccess {
    return {
      community: this.get(r),
    };
  }
}
