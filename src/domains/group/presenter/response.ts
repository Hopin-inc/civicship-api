import {
  GqlEvent,
  GqlGroup,
  GqlGroupChangeOrganizationSuccess,
  GqlGroupCreateSuccess,
  GqlGroupDeleteSuccess,
  GqlGroupsConnection,
  GqlGroupUpdateChildSuccess,
  GqlGroupUpdateContentSuccess,
  GqlGroupUpdateEventSuccess,
  GqlGroupUpdateParentSuccess,
  GqlGroupUpdateTargetSuccess,
  GqlGroupUpdateUserSuccess,
  GqlOrganization,
  GqlTarget,
  GqlUser,
} from "@/types/graphql";
import {
  GroupCreatePayloadWithArgs,
  GroupGetPayloadWithArgs,
  GroupUpdateContentPayloadWithArgs,
} from "@/domains/group/type";

export default class GroupResponseFormat {
  static queryPublic(groups: GqlGroup[], hasNextPage: boolean): GqlGroupsConnection {
    return {
      totalCount: groups.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: groups[0]?.id,
        endCursor: groups.length ? groups[groups.length - 1].id : undefined,
      },
      edges: groups.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(group: GroupGetPayloadWithArgs): GqlGroup {
    return {
      ...group,
      agendas: group.agendas?.map((r) => r.agenda),
      cities: group.cities?.map((r) => ({
        ...r.city,
        state: r.city.state,
      })),
      organization: {
        ...group.organization,
        city: {
          ...group.organization.city,
          state: group.organization.city.state,
        },
        state: group.organization.state,
      },

      users: group.users?.map((r) => r.user),
      events: group.events?.map((r) => r.event),

      targets: group.targets?.map((target) => target),
      parent: group.parent,
      children: group.children?.map((child) => child),
    };
  }

  static create(group: GroupCreatePayloadWithArgs): GqlGroupCreateSuccess {
    return {
      __typename: "GroupCreateSuccess",
      group: {
        ...group,
        agendas: group.agendas.map((r) => r.agenda),
        cities: group.cities.map((r) => ({
          ...r.city,
          state: r.city.state,
        })),
        organization: {
          ...group.organization,
          city: {
            ...group.organization.city,
            state: group.organization.city.state,
          },
          state: group.organization.state,
        },
        parent: group.parent,
      },
    };
  }

  static updateContent(group: GroupUpdateContentPayloadWithArgs): GqlGroupUpdateContentSuccess {
    return {
      __typename: "GroupUpdateContentSuccess",
      group: {
        ...group,
        agendas: group.agendas.map((r) => r.agenda),
        cities: group.cities.map((r) => ({
          ...r.city,
          state: r.city.state,
        })),
      },
    };
  }

  static changeOrganization(
    group: GqlGroup,
    organization: GqlOrganization,
  ): GqlGroupChangeOrganizationSuccess {
    return {
      __typename: "GroupChangeOrganizationSuccess",
      group,
      organization,
    };
  }

  static delete(id: string): GqlGroupDeleteSuccess {
    return { groupId: id };
  }

  static updateUser(group: GqlGroup, user: GqlUser): GqlGroupUpdateUserSuccess {
    return {
      __typename: "GroupUpdateUserSuccess",
      group,
      user,
    };
  }

  static updateEvent(group: GqlGroup, event: GqlEvent): GqlGroupUpdateEventSuccess {
    return {
      __typename: "GroupUpdateEventSuccess",
      group,
      event,
    };
  }

  static updateTarget(group: GqlGroup, target: GqlTarget): GqlGroupUpdateTargetSuccess {
    return {
      __typename: "GroupUpdateTargetSuccess",
      group,
      target,
    };
  }

  static updateParent(group: GqlGroup, parent: GqlGroup): GqlGroupUpdateParentSuccess {
    return {
      __typename: "GroupUpdateParentSuccess",
      group,
      parent,
    };
  }

  static updateChild(group: GqlGroup, child: GqlGroup): GqlGroupUpdateChildSuccess {
    return {
      __typename: "GroupUpdateChildSuccess",
      group,
      child,
    };
  }
}
