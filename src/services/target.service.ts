import {
  GqlAddGroupToTargetPayload,
  GqlAddOrganizationToTargetPayload,
  GqlMutationAddGroupToTargetArgs,
  GqlMutationAddOrganizationToTargetArgs,
  GqlMutationCreateTargetArgs,
  GqlMutationDeleteTargetArgs,
  GqlMutationRemoveGroupFromTargetArgs,
  GqlMutationRemoveOrganizationFromTargetArgs,
  GqlQueryTargetArgs,
  GqlQueryTargetsArgs,
  GqlRemoveGroupFromTargetPayload,
  GqlRemoveOrganizationFromTargetPayload,
  GqlTarget,
  GqlMutationUpdateIndexOfTargetArgs,
  GqlUpdateIndexOfTargetPayload,
  GqlUpdateTargetInfoPayload,
  GqlMutationUpdateTargetInfoArgs,
} from "@/types/graphql";
import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";

class TargetService {
  private static db = prismaClient;

  static async queryTargets({
    cursor,
    filter,
    sort,
    first,
  }: GqlQueryTargetsArgs) {
    const take = first ?? 10;
    const where: Prisma.TargetWhereInput = {
      AND: [
        filter?.organizationId ? { organizationId: filter.organizationId } : {},
        filter?.keyword ? { name: { contains: filter.keyword } } : {},
      ],
    };
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      updatedAt: sort?.updatedAt ?? Prisma.SortOrder.desc,
    };

    const data = await this.db.target.findMany({
      where,
      orderBy,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
    const hasNextPage = data.length > take;
    const formattedData = data.slice(0, take).map((record) => ({
      ...record,
    }));
    return {
      totalCount: data.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: formattedData[0]?.id,
        endCursor: formattedData.length
          ? formattedData[formattedData.length - 1].id
          : undefined,
      },
      edges: formattedData.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static async getTarget({
    id,
  }: GqlQueryTargetArgs): Promise<GqlTarget | null> {
    return this.db.target.findUnique({ where: { id } });
  }

  static async createTarget({ content }: GqlMutationCreateTargetArgs) {
    const { organizationId, groupId, indexId, ...properties } = content;
    const data: Prisma.TargetCreateInput = {
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
    return this.db.target.create({ data });
  }

  static async deleteTarget({
    id,
  }: GqlMutationDeleteTargetArgs): Promise<GqlTarget> {
    return this.db.target.delete({
      where: { id },
    });
  }

  static async updateTargetInfo({
    id,
    content,
  }: GqlMutationUpdateTargetInfoArgs): Promise<GqlUpdateTargetInfoPayload> {
    const { indexId, ...properties } = content;
    const data: Prisma.TargetUpdateInput = {
      ...properties,
      index: {
        connect: { id: indexId },
      },
    };
    return this.db.target.update({
      where: { id },
      data,
    });
  }

  static async addGroupToTarget({
    id,
    content,
  }: GqlMutationAddGroupToTargetArgs): Promise<GqlAddGroupToTargetPayload> {
    const [target, group] = await this.db.$transaction([
      this.db.target.update({
        where: { id },
        data: {
          group: {
            connect: {
              id: content.groupId,
            },
          },
        },
      }),
      this.db.group.findUnique({
        where: { id: content.groupId },
      }),
    ]);

    if (!group) {
      throw new Error(`Group with ID ${content.groupId} not found`);
    }

    return {
      target,
      group,
    };
  }

  static async removeGroupFromTarget({
    id,
    content,
  }: GqlMutationRemoveGroupFromTargetArgs): Promise<GqlRemoveGroupFromTargetPayload> {
    const [target, group] = await this.db.$transaction([
      this.db.target.update({
        where: { id },
        data: {
          group: {
            disconnect: { id: content.groupId },
          },
        },
      }),
      this.db.group.findUnique({
        where: { id: content.groupId },
      }),
    ]);

    if (!group) {
      throw new Error(`Group with ID ${content.groupId} not found`);
    }

    return {
      target,
      group,
    };
  }

  static async addOrganizationToTarget({
    id,
    content,
  }: GqlMutationAddOrganizationToTargetArgs): Promise<GqlAddOrganizationToTargetPayload> {
    const [target, organization] = await this.db.$transaction([
      this.db.target.update({
        where: { id },
        data: {
          organization: {
            connect: { id: content.organizationId },
          },
        },
      }),
      this.db.organization.findUnique({
        where: { id: content.organizationId },
        include: {
          state: true,
          city: {
            include: {
              state: true,
            },
          },
        },
      }),
    ]);

    if (!organization) {
      throw new Error(
        `Organization with ID ${content.organizationId} not found`,
      );
    }

    return {
      target,
      organization,
    };
  }

  static async removeOrganizationFromTarget({
    id,
    content,
  }: GqlMutationRemoveOrganizationFromTargetArgs): Promise<GqlRemoveOrganizationFromTargetPayload> {
    const [target, organization] = await this.db.$transaction([
      this.db.target.update({
        where: { id },
        data: {
          organization: {
            disconnect: { id: content.organizationId },
          },
        },
      }),
      this.db.organization.findUnique({
        where: { id: content.organizationId },
        include: {
          state: true,
          city: {
            include: {
              state: true,
            },
          },
        },
      }),
    ]);

    if (!organization) {
      throw new Error(
        `Organization with ID ${content.organizationId} not found`,
      );
    }

    return {
      target,
      organization,
    };
  }

  static async updateIndexToTarget({
    id,
    content,
  }: GqlMutationUpdateIndexOfTargetArgs): Promise<GqlUpdateIndexOfTargetPayload> {
    const [target, index] = await this.db.$transaction([
      this.db.target.update({
        where: { id },
        data: {
          index: {
            connect: { id: content.indexId },
          },
        },
      }),
      this.db.index.findUnique({
        where: { id: content.indexId },
      }),
    ]);

    if (!index) {
      throw new Error(`Index with ID ${content.indexId} not found`);
    }

    return {
      target,
      index,
    };
  }
}

export default TargetService;
