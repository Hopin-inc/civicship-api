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
      __typename: "CommunitiesConnection",
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
      __typename: "Community",
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
      __typename: "CommunityCreateSuccess",
      community: this.get(r),
    };
  }

  static delete(r: PrismaCommunityDetail): GqlCommunityDeleteSuccess {
    return {
      __typename: "CommunityDeleteSuccess",
      communityId: r.id,
    };
  }

  static update(r: PrismaCommunityDetail): GqlCommunityUpdateProfileSuccess {
    return {
      __typename: "CommunityUpdateProfileSuccess",
      community: this.get(r),
    };
  }
}
