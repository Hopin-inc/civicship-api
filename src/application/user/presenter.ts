import { GqlUser, GqlUsersConnection, GqlUserUpdateProfileSuccess } from "@/types/graphql";
import { UserGetPayloadWithArgs } from "@/application/user/data/type";

export default class UserOutputFormat {
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
    return r;
  }

  static updateProfile(r: UserGetPayloadWithArgs): GqlUserUpdateProfileSuccess {
    return {
      __typename: "UserUpdateProfileSuccess",
      user: this.get(r),
    };
  }
}
