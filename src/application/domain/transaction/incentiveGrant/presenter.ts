import { PrismaIncentiveGrant } from "./data/type";
import { GqlIncentiveGrant, GqlIncentiveGrantsConnection } from "@/types/graphql";
import CommunityPresenter from "@/application/domain/account/community/presenter";
import UserPresenter from "@/application/domain/account/user/presenter";

export default class IncentiveGrantPresenter {
  static query(r: GqlIncentiveGrant[], totalCount: number, hasNextPage: boolean, cursor?: string): GqlIncentiveGrantsConnection {
    return {
      __typename: "IncentiveGrantsConnection",
      totalCount,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        startCursor: r[0]?.id,
        endCursor: r.length ? r[r.length - 1].id : undefined,
      },
      edges: r.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(r: PrismaIncentiveGrant): GqlIncentiveGrant {
    const { user, community, ...rest } = r;
    return {
      __typename: "IncentiveGrant",
      ...rest,
      user: UserPresenter.get(user),
      community: CommunityPresenter.get(community),
    } as GqlIncentiveGrant;
  }
}
