import {
  GqlCommunitiesConnection,
  GqlCommunity,
  GqlCommunityCreateSuccess,
  GqlCommunityDeleteSuccess,
  GqlCommunityUpdateProfileSuccess,
} from "@/types/graphql";
import { CommunityPayloadWithArgs } from "@/infra/prisma/types/community";

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
    return r;
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
