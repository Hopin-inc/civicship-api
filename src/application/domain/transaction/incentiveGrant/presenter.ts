import { PrismaIncentiveGrant } from "./data/type";

// Note: GraphQL types will be generated after running `pnpm gql:generate`
// Using 'any' temporarily until types are available
type GqlIncentiveGrant = any;
type GqlIncentiveGrantsConnection = any;

export default class IncentiveGrantPresenter {
  static query(r: GqlIncentiveGrant[], hasNextPage: boolean, cursor?: string): GqlIncentiveGrantsConnection {
    return {
      __typename: "IncentiveGrantsConnection",
      totalCount: r.length,
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
