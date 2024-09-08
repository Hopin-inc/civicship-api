import { GqlTargetCreateInput, GqlQueryTargetsArgs } from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { RELATION_ACTION } from "@/consts/prisma";

export default class TargetInputFormat {
  static filter({ filter }: GqlQueryTargetsArgs): Prisma.TargetWhereInput {
    return {
      AND: [
        filter?.organizationId ? { organizationId: filter?.organizationId } : {},
        filter?.keyword
          ? {
              OR: [{ name: { contains: filter?.keyword } }],
            }
          : {},
      ],
    };
  }

  static sort({ sort }: GqlQueryTargetsArgs): Prisma.TargetOrderByWithRelationInput {
    return {
      updatedAt: sort?.updatedAt ?? Prisma.SortOrder.desc,
    };
  }

  static create(input: GqlTargetCreateInput): Prisma.TargetCreateInput {
    const { organizationId, groupId, indexId, ...properties } = input;

    return {
      ...properties,
      organization: {
        connect: { id: organizationId },
      },
      group: {
        connect: { id: groupId },
      },
      index: {
        connect: { id: indexId },
      },
    };
  }

  static updateGroup(groupId: string, action: RELATION_ACTION): Prisma.TargetUpdateInput {
    const data: Prisma.TargetUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECT:
        data.group = {
          connect: { id: groupId },
        };
        break;

      case RELATION_ACTION.DISCONNECT:
        data.group = {
          disconnect: true,
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }

  static updateOrganization(
    organizationId: string,
    action: RELATION_ACTION,
  ): Prisma.TargetUpdateInput {
    const data: Prisma.TargetUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECT:
        data.organization = {
          connect: { id: organizationId },
        };
        break;

      case RELATION_ACTION.DISCONNECT:
        data.organization = {
          disconnect: true,
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }

  static updateIndex(indexId: number, action: RELATION_ACTION): Prisma.TargetUpdateInput {
    const data: Prisma.TargetUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECT:
        data.index = {
          connect: { id: indexId },
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }
}
