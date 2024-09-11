import {
  GqlOrganization,
  GqlOrganizationsConnection,
  GqlOrganizationCreateSuccess,
  GqlOrganizationDeleteSuccess,
  GqlOrganizationUpdateContentSuccess,
  GqlUser,
  GqlOrganizationUpdateUserSuccess,
  GqlTarget,
  GqlGroup,
  GqlOrganizationUpdateTargetSuccess,
  GqlOrganizationUpdateGroupSuccess,
  GqlOrganizationSwitchPrivacySuccess,
  GqlOrganizationUpdateDefaultSuccess,
} from "@/types/graphql";
import {
  OrganizationCreatePayloadWithArgs,
  OrganizationDefaultPayloadWithArgs,
  OrganizationGetPayloadWithArgs,
  OrganizationUpdateContentPayloadWithArgs,
} from "@/domains/organization/type";

export default class OrganizationResponseFormat {
  static query(organizations: GqlOrganization[], hasNextPage: boolean): GqlOrganizationsConnection {
    return {
      totalCount: organizations.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: organizations[0]?.id,
        endCursor: organizations.length ? organizations[organizations.length - 1].id : undefined,
      },
      edges: organizations.map((organization) => ({
        cursor: organization.id,
        node: organization,
      })),
    };
  }

  static get(organization: OrganizationGetPayloadWithArgs): GqlOrganization {
    return {
      ...organization,
      city: {
        ...organization.city,
        state: organization.city?.state,
      },
      agendas: organization.agendas?.map((r) => r.agenda),
      users: organization.users?.map((r) => r.user),
      groups: organization.groups?.map((group) => ({
        ...group,
      })),
      targets: organization.targets?.map((target) => ({
        ...target,
      })),
    };
  }

  static create(organization: OrganizationCreatePayloadWithArgs): GqlOrganizationCreateSuccess {
    return {
      __typename: "OrganizationCreateSuccess",
      organization: this.get(organization),
    };
  }

  static delete(id: string): GqlOrganizationDeleteSuccess {
    return {
      __typename: "OrganizationDeleteSuccess",
      organizationId: id,
    };
  }

  static updateContent(
    organization: OrganizationUpdateContentPayloadWithArgs,
  ): GqlOrganizationUpdateContentSuccess {
    return {
      __typename: "OrganizationUpdateContentSuccess",
      organization: {
        ...organization,
        city: {
          ...organization.city,
          state: organization.city?.state,
        },
        agendas: organization.agendas?.map((r) => r.agenda),
        cities: organization.cities?.map((r) => ({
          ...r.city,
          state: r.city.state,
        })),
        users: organization.users?.map((r) => r.user),
      },
    };
  }

  static updateDefaultInfo(
    organization: OrganizationDefaultPayloadWithArgs,
  ): GqlOrganizationUpdateDefaultSuccess {
    return {
      __typename: "OrganizationUpdateDefaultSuccess",
      organization: {
        ...organization,
        city: {
          ...organization.city,
          state: organization.city?.state,
        },
      },
    };
  }

  static switchPrivacy(organization: GqlOrganization): GqlOrganizationSwitchPrivacySuccess {
    return {
      __typename: "OrganizationSwitchPrivacySuccess",
      organization,
    };
  }

  static updateUser(
    organization: GqlOrganization,
    user: GqlUser,
  ): GqlOrganizationUpdateUserSuccess {
    return {
      __typename: "OrganizationUpdateUserSuccess",
      organization,
      user,
    };
  }

  static updateTarget(
    organization: GqlOrganization,
    target: GqlTarget,
  ): GqlOrganizationUpdateTargetSuccess {
    return {
      __typename: "OrganizationUpdateTargetSuccess",
      organization,
      target,
    };
  }

  static updateGroup(
    organization: GqlOrganization,
    group: GqlGroup,
  ): GqlOrganizationUpdateGroupSuccess {
    return {
      __typename: "OrganizationUpdateGroupSuccess",
      organization,
      group,
    };
  }
}
