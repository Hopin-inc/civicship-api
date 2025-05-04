import { GqlUser, GqlUsersConnection, GqlUserUpdateProfileSuccess } from "@/types/graphql";
import { PrismaUserDetail } from "@/application/domain/account/user/data/type";

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
    return {
      ...r,
      identities: [],
      articlesAboutMe: [],
      articlesWrittenByMe: [],
      evaluationCreatedByMe: [],
      evaluations: [],
      memberships: [],
      membershipChangedByMe: [],
      opportunitiesCreatedByMe: [],
      participationStatusChangedByMe: [],
      participations: [],
      reservationStatusChangedByMe: [],
      reservations: [],
      ticketStatusChangedByMe: [],
      wallets: [],
      portfolios: [],
    };
  }

  static updateProfile(r: PrismaUserDetail): GqlUserUpdateProfileSuccess {
    return {
      __typename: "UserUpdateProfileSuccess",
      user: this.get(r),
    };
  }
}
