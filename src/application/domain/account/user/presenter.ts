import { GqlUser, GqlUsersConnection, GqlUserUpdateProfileSuccess } from "@/types/graphql";
import { PrismaUser, PrismaUserDetail } from "@/application/domain/account/user/data/type";

export default class UserPresenter {
  static query(users: GqlUser[], hasNextPage: boolean, cursor?: string): GqlUsersConnection {
    return {
      __typename: "UsersConnection",
      totalCount: users.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        startCursor: users[0]?.id,
        endCursor: users.length ? users[users.length - 1].id : undefined,
      },
      edges: users.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(r: PrismaUserDetail): GqlUser {
    return {
      __typename: "User",
      ...r,
    };
  }

  static updateProfile(r: PrismaUserDetail): GqlUserUpdateProfileSuccess {
    return {
      __typename: "UserUpdateProfileSuccess",
      user: this.get(r),
    };
  }

  static formatPortfolio(r: PrismaUser): GqlUser {
    const { image, identities, ...prop } = r;
    return {
      __typename: "User",
      ...prop,
      identities,
      image: image?.url,
    };
  }
}
