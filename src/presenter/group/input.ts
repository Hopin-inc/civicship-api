import {
  GqlGroupChangeOrganizationInput,
  GqlGroupUpdateContentInput,
  GqlMutationGroupCreateArgs,
  GqlQueryGroupsArgs,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { RELATION_ACTION } from "@/consts";
import { calculateDifferences } from "@/utils";
import { GroupUpdateContentPayloadWithArgs } from "@/types/include/group.type";

export default class GroupInputFormat {
  static filter({ filter }: GqlQueryGroupsArgs): Prisma.GroupWhereInput {
    return {
      AND: [
        filter?.agendaId ? { agendas: { some: { agendaId: filter?.agendaId } } } : {},
        filter?.organizationId ? { organizationId: filter?.organizationId } : {},
        filter?.keyword
          ? {
              OR: [{ name: { contains: filter?.keyword } }, { bio: { contains: filter?.keyword } }],
            }
          : {},
      ],
    };
  }

  static sort({ sort }: GqlQueryGroupsArgs): Prisma.GroupOrderByWithRelationInput[] {
    return [
      { createdAt: sort?.createdAt ?? Prisma.SortOrder.desc },
      { updatedAt: sort?.updatedAt ?? Prisma.SortOrder.desc },
    ];
  }

  static create({ input }: GqlMutationGroupCreateArgs): Prisma.GroupCreateInput {
    const { organizationId, agendaIds, cityCodes, parentId, childrenIds, ...properties } = input;

    return {
      ...properties,
      agendas: {
        create: agendaIds?.map((agendaId) => ({ agenda: { connect: { id: agendaId } } })),
      },
      cities: {
        create: cityCodes?.map((cityCode) => ({ city: { connect: { code: cityCode } } })),
      },
      organization: {
        connect: { id: organizationId },
      },
      parent: { connect: { id: parentId } },
      children: {
        connect: childrenIds?.map((childId) => ({ id: childId })),
      },
    };
  }

  static updateContent(
    existingGroup: GroupUpdateContentPayloadWithArgs,
    input: GqlGroupUpdateContentInput,
  ): Prisma.GroupUpdateInput {
    const { agendaIds, cityCodes, ...properties } = input;

    const [
      { toAdd: agendasToAdd, toRemove: agendasToRemove },
      { toAdd: citiesToAdd, toRemove: citiesToRemove },
    ] = [
      calculateDifferences(new Set(existingGroup.agendas.map((r) => r.agendaId)), agendaIds),
      calculateDifferences(new Set(existingGroup.cities.map((r) => r.cityCode)), cityCodes),
    ];

    return {
      ...properties,
      agendas: {
        createMany: {
          data: agendasToAdd.map((agendaId) => ({
            agendaId: agendaId,
          })),
          skipDuplicates: true,
        },
        deleteMany: {
          agendaId: { in: agendasToRemove },
        },
      },
      cities: {
        createMany: {
          data: citiesToAdd.map((cityCode) => ({
            cityCode: cityCode,
          })),
          skipDuplicates: true,
        },
        deleteMany: {
          cityCode: { in: citiesToRemove },
        },
      },
    };
  }

  static changeOrganization(input: GqlGroupChangeOrganizationInput): Prisma.GroupUpdateInput {
    const { organizationId } = input;

    return {
      organization: {
        connect: {
          id: organizationId,
        },
      },
    };
  }

  static updateUser(id: string, userId: string, action: RELATION_ACTION): Prisma.GroupUpdateInput {
    const data: Prisma.GroupUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECTORCREATE:
        data.users = {
          connectOrCreate: {
            where: {
              userId_groupId: { userId, groupId: id },
            },
            create: { userId },
          },
        };
        break;

      case RELATION_ACTION.DELETE:
        data.users = {
          delete: {
            userId_groupId: { userId, groupId: id },
            userId,
          },
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }

  static updateEvent(
    id: string,
    eventId: string,
    action: RELATION_ACTION,
  ): Prisma.GroupUpdateInput {
    const data: Prisma.GroupUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECTORCREATE:
        data.events = {
          connectOrCreate: {
            where: {
              groupId_eventId: { eventId, groupId: id },
            },
            create: { eventId },
          },
        };
        break;

      case RELATION_ACTION.DELETE:
        data.events = {
          delete: {
            groupId_eventId: { eventId, groupId: id },
            eventId,
          },
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }

  static updateTarget(
    id: string,
    targetId: string,
    action: RELATION_ACTION,
  ): Prisma.GroupUpdateInput {
    const data: Prisma.GroupUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECT:
        data.targets = {
          connect: {
            id: targetId,
          },
        };
        break;

      case RELATION_ACTION.DISCONNECT:
        data.targets = {
          disconnect: {
            id: targetId,
          },
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }

  static updateParent(
    id: string,
    parentId: string,
    action: RELATION_ACTION,
  ): Prisma.GroupUpdateInput {
    const data: Prisma.GroupUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECT:
        data.parent = {
          connect: {
            id: parentId,
          },
        };
        break;

      case RELATION_ACTION.DISCONNECT:
        data.parent = {
          disconnect: {
            id: parentId,
          },
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }

  static updateChild(
    id: string,
    childId: string,
    action: RELATION_ACTION,
  ): Prisma.GroupUpdateInput {
    const data: Prisma.GroupUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECT:
        data.children = {
          connect: {
            id: childId,
          },
        };
        break;

      case RELATION_ACTION.DISCONNECT:
        data.children = {
          disconnect: {
            id: childId,
          },
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }
}
