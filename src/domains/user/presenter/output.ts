import { GqlUser, GqlUsersConnection, GqlUserUpdateProfileSuccess } from "@/types/graphql";
import { UserGetPayloadWithArgs } from "@/domains/user/type";

export default class UserResponseFormat {
  static query(users: GqlUser[], hasNextPage: boolean): GqlUsersConnection {
    return {
      totalCount: users.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: users[0]?.id,
        endCursor: users.length ? users[users.length - 1].id : undefined,
      },
      edges: users.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(r: UserGetPayloadWithArgs): GqlUser {
    const { memberships, wallets, ...prop } = r;

    return {
      ...prop,
      memberships: memberships?.map((membership) => ({
        ...membership,
      })),
      wallets: wallets?.map((wallet) => ({
        ...wallet,
        currentPointView: wallet.currentPointView
          ? {
              walletId: wallet.id,
              currentPoint: wallet.currentPointView.currentPoint,
            }
          : null,
      })),
    };
  }

  static updateProfile(r: UserGetPayloadWithArgs): GqlUserUpdateProfileSuccess {
    return {
      __typename: "UserUpdateProfileSuccess",
      user: this.get(r),
    };
  }
}
