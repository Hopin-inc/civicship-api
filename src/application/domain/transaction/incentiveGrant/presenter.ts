import { PrismaIncentiveGrant } from "./data/type";
import { GqlIncentiveGrant, GqlIncentiveGrantsConnection } from "@/types/graphql";

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
    return {
      __typename: "IncentiveGrant",
      ...r,
    };
  }
}
