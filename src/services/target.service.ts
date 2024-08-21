import {
  GqlTargetAddGroupPayload,
  GqlTargetAddOrganizationPayload,
  GqlMutationTargetAddGroupArgs,
  GqlMutationTargetAddOrganizationArgs,
  GqlMutationTargetCreateArgs,
  GqlMutationTargetDeleteArgs,
  GqlMutationTargetRemoveGroupArgs,
  GqlMutationTargetRemoveOrganizationArgs,
  GqlQueryTargetArgs,
  GqlQueryTargetsArgs,
  GqlTargetRemoveGroupPayload,
  GqlTargetRemoveOrganizationPayload,
  GqlTarget,
  GqlMutationTargetUpdateIndexArgs,
  GqlTargetUpdateIndexPayload,
  GqlTargetUpdatePayload,
  GqlMutationTargetUpdateArgs,
  GqlTargetCreatePayload,
  GqlTargetDeletePayload,
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

  static async targetCreate({
    input,
  }: GqlMutationTargetCreateArgs): Promise<GqlTargetCreatePayload> {
    const { organizationId, groupId, indexId, ...properties } = input;
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
    const target: GqlTarget = await this.db.target.create({ data });
    return { target };
  }

  static async targetDelete({
    id,
  }: GqlMutationTargetDeleteArgs): Promise<GqlTargetDeletePayload> {
    await this.db.target.delete({
      where: { id },
    });
    return { targetId: id };
  }

  static async targetUpdate({
    id,
    input,
  }: GqlMutationTargetUpdateArgs): Promise<GqlTargetUpdatePayload> {
    const { indexId, ...properties } = input;
    const data: Prisma.TargetUpdateInput = {
      ...properties,
      index: {
        connect: { id: indexId },
      },
    };
    const target: GqlTarget = await this.db.target.update({
      where: { id },
      data,
    });
    return { target };
  }

  static async targetAddGroup({
    id,
    input,
  }: GqlMutationTargetAddGroupArgs): Promise<GqlTargetAddGroupPayload> {
    const [target, group] = await this.db.$transaction([
      this.db.target.update({
        where: { id },
        data: {
          group: {
            connect: {
              id: input.groupId,
            },
          },
        },
      }),
      this.db.group.findUnique({
        where: { id: input.groupId },
      }),
    ]);

    if (!group) {
      throw new Error(`Group with ID ${input.groupId} not found`);
    }

    return {
      target,
      group,
    };
  }

  static async targetRemoveGroup({
    id,
    input,
  }: GqlMutationTargetRemoveGroupArgs): Promise<GqlTargetRemoveGroupPayload> {
    const [target, group] = await this.db.$transaction([
      this.db.target.update({
        where: { id },
        data: {
          group: {
            disconnect: { id: input.groupId },
          },
        },
      }),
      this.db.group.findUnique({
        where: { id: input.groupId },
      }),
    ]);

    if (!group) {
      throw new Error(`Group with ID ${input.groupId} not found`);
    }

    return {
      target,
      group,
    };
  }

  static async targetAddOrganization({
    id,
    input,
  }: GqlMutationTargetAddOrganizationArgs): Promise<GqlTargetAddOrganizationPayload> {
    const [target, organization] = await this.db.$transaction([
      this.db.target.update({
        where: { id },
        data: {
          organization: {
            connect: { id: input.organizationId },
          },
        },
      }),
      this.db.organization.findUnique({
        where: { id: input.organizationId },
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
      throw new Error(`Organization with ID ${input.organizationId} not found`);
    }

    return {
      target,
      organization,
    };
  }

  static async targetRemoveOrganization({
    id,
    input,
  }: GqlMutationTargetRemoveOrganizationArgs): Promise<GqlTargetRemoveOrganizationPayload> {
    const [target, organization] = await this.db.$transaction([
      this.db.target.update({
        where: { id },
        data: {
          organization: {
            disconnect: { id: input.organizationId },
          },
        },
      }),
      this.db.organization.findUnique({
        where: { id: input.organizationId },
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
      throw new Error(`Organization with ID ${input.organizationId} not found`);
    }

    return {
      target,
      organization,
    };
  }

  static async targetUpdateIndex({
    id,
    input,
  }: GqlMutationTargetUpdateIndexArgs): Promise<GqlTargetUpdateIndexPayload> {
    const [target, index] = await this.db.$transaction([
      this.db.target.update({
        where: { id },
        data: {
          index: {
            connect: { id: input.indexId },
          },
        },
      }),
      this.db.index.findUnique({
        where: { id: input.indexId },
      }),
    ]);

    if (!index) {
      throw new Error(`Index with ID ${input.indexId} not found`);
    }

    return {
      target,
      index,
    };
  }
}

export default TargetService;
