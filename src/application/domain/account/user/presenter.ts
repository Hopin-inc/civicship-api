import { GqlUser, GqlUsersConnection, GqlUserUpdateProfileSuccess } from "@/types/graphql";
import { PrismaUser, PrismaUserDetail } from "@/application/domain/account/user/data/type";

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

  static get(r: PrismaUserDetail): GqlUser {
    return r;
  }

  static updateProfile(r: PrismaUserDetail): GqlUserUpdateProfileSuccess {
    return {
      user: this.get(r),
    };
  }

  static formatPortfolio(r: PrismaUser): GqlUser {
    const { identities, image, ...prop } = r;

    return {
      ...prop,
      identities: identities,
      image: image?.url,
    };
  }
}
