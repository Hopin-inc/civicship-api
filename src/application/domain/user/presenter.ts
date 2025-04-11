import { GqlUser, GqlUsersConnection, GqlUserUpdateProfileSuccess } from "@/types/graphql";
import { PrismaUser } from "@/application/domain/user/data/type";

export default class UserPresenter {
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

  static get(r: PrismaUser): GqlUser {
    const { image, ...prop } = r;
    return {
      ...prop,
      image: image?.url ?? null,
    };
  }

  static updateProfile(r: PrismaUser): GqlUserUpdateProfileSuccess {
    return {
      __typename: "UserUpdateProfileSuccess",
      user: this.get(r),
    };
  }
}
