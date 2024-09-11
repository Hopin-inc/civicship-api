import {
  GqlMutationUserCreateArgs,
  GqlQueryUsersArgs,
  GqlUserUpdateContentInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { RELATION_ACTION } from "@/consts/prisma";
import { calculateDifferences } from "@/utils";
import { UserUpdateContentPayloadWithArgs } from "@/domains/user/type";

export default class UserInputFormat {
  static filter({ filter }: GqlQueryUsersArgs): Prisma.UserWhereInput {
    return {
      AND: [
        filter?.agendaId ? { agendas: { some: { agendaId: filter?.agendaId } } } : {},
        filter?.keyword
          ? {
              OR: [
                { bio: { contains: filter?.keyword } },
                { lastName: { contains: filter?.keyword } },
                { middleName: { contains: filter?.keyword } },
                { firstName: { contains: filter?.keyword } },
              ],
            }
          : {},
      ],
    };
  }

  static sort({ sort }: GqlQueryUsersArgs): Prisma.UserOrderByWithRelationInput {
    return {
      updatedAt: sort?.updatedAt ?? Prisma.SortOrder.desc,
    };
  }

  static create({ input }: GqlMutationUserCreateArgs): Prisma.UserCreateInput {
    const { agendaIds, cityCodes, organizationIds, groupIds, ...properties } = input;

    return {
      ...properties,
      agendas: {
        create: agendaIds?.map((agendaId) => ({ agendaId })),
      },
      cities: {
        create: cityCodes?.map((cityCode) => ({ cityCode })),
      },
      organizations: {
        create: organizationIds?.map((organizationId) => ({ organizationId })),
      },
      groups: {
        create: groupIds?.map((groupId) => ({ groupId })),
      },
    };
  }

  static updateContent(
    existingUser: UserUpdateContentPayloadWithArgs,
    input: GqlUserUpdateContentInput,
  ): Prisma.UserUpdateInput {
    const { agendaIds, cityCodes, ...properties } = input;

    const [
      { toAdd: agendasToAdd, toRemove: agendasToRemove },
      { toAdd: citiesToAdd, toRemove: citiesToRemove },
    ] = [
      calculateDifferences(new Set(existingUser.agendas.map((r) => r.agendaId)), agendaIds),
      calculateDifferences(new Set(existingUser.cities.map((r) => r.cityCode)), cityCodes),
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

  static updateGroup(
    userId: string,
    groupId: string,
    action: RELATION_ACTION,
  ): Prisma.UserUpdateInput {
    const data: Prisma.UserUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECT_OR_CREATE:
        data.groups = {
          connectOrCreate: {
            where: {
              userId_groupId: { userId, groupId },
            },
            create: { groupId },
          },
        };
        break;

      case RELATION_ACTION.DELETE:
        data.groups = {
          delete: {
            userId_groupId: { userId, groupId },
          },
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }

  static updateOrganization(
    userId: string,
    organizationId: string,
    action: RELATION_ACTION,
  ): Prisma.UserUpdateInput {
    const data: Prisma.UserUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECT_OR_CREATE:
        data.organizations = {
          connectOrCreate: {
            where: {
              userId_organizationId: { userId, organizationId },
            },
            create: { organizationId },
          },
        };
        break;

      case RELATION_ACTION.DELETE:
        data.organizations = {
          delete: {
            userId_organizationId: { userId, organizationId },
          },
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }

  static updateActivity(
    userId: string,
    activityId: string,
    action: RELATION_ACTION,
  ): Prisma.UserUpdateInput {
    const data: Prisma.UserUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECT_OR_CREATE:
        data.activities = {
          connect: {
            id: activityId,
          },
        };
        break;

      case RELATION_ACTION.DISCONNECT:
        data.activities = {
          disconnect: {
            id: activityId,
          },
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }
}
