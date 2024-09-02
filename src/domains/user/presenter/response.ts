import {
  GqlActivity,
  GqlGroup,
  GqlOrganization,
  GqlUser,
  GqlUserCreateSuccess,
  GqlUserDeleteSuccess,
  GqlUsersConnection,
  GqlUserUpdateActivitySuccess,
  GqlUserUpdateContentSuccess,
  GqlUserUpdateGroupSuccess,
  GqlUserUpdateOrganizationSuccess,
  GqlUserUpdatePrivacySuccess,
} from "@/types/graphql";
import {
  UserCreatePayloadWithArgs,
  UserGetPayloadWithArgs,
  UserUpdateContentPayloadWithArgs,
} from "@/domains/user/type";

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

  static get(user: UserGetPayloadWithArgs): GqlUser {
    return {
      ...user,
      agendas: user.agendas?.map((r) => r.agenda),
      cities: user.cities?.map((r) => ({
        ...r.city,
        state: r.city.state,
      })),
      groups: user.groups?.map((r) => r.group),
      organizations: user.organizations?.map((r) => r.organization),
      activities: user.activities?.map((r) => r),
      likes: user.likes?.map((r) => r),
      comments: user.comments?.map((r) => r),
    };
  }

  static create(user: UserCreatePayloadWithArgs): GqlUserCreateSuccess {
    return {
      __typename: "UserCreateSuccess",
      user: {
        ...user,
        groups: user.groups?.map((r) => r.group),
        organizations: user.organizations?.map((r) => r.organization),
      },
    };
  }

  static updateContent(user: UserUpdateContentPayloadWithArgs): GqlUserUpdateContentSuccess {
    return {
      __typename: "UserUpdateContentSuccess",
      user: {
        ...user,
        agendas: user.agendas.map((r) => r.agenda),
        cities: user.cities.map((r) => ({
          ...r.city,
          state: r.city.state,
        })),
      },
    };
  }

  static switchPrivacy(user: GqlUser): GqlUserUpdatePrivacySuccess {
    return {
      __typename: "UserUpdatePrivacySuccess",
      user,
    };
  }

  static delete(id: string): GqlUserDeleteSuccess {
    return { userId: id };
  }

  static updateGroup(user: GqlUser, group: GqlGroup): GqlUserUpdateGroupSuccess {
    return {
      __typename: "UserUpdateGroupSuccess",
      user,
      group,
    };
  }

  static updateOrganization(
    user: GqlUser,
    organization: GqlOrganization,
  ): GqlUserUpdateOrganizationSuccess {
    return {
      __typename: "UserUpdateOrganizationSuccess",
      user,
      organization,
    };
  }

  static updateActivity(user: GqlUser, activity: GqlActivity): GqlUserUpdateActivitySuccess {
    return {
      __typename: "UserUpdateActivitySuccess",
      user,
      activity,
    };
  }
}
