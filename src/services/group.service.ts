import { prismaClient } from "@/prisma/client";
import {
  GqlGroupsConnection,
  GqlGroup,
  GqlMutationCreateGroupArgs,
  GqlMutationDeleteGroupArgs,
  GqlMutationUpdateGroupArgs,
  GqlQueryGroupsArgs,
  GqlQueryGroupArgs,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class GroupService {
  private static db = prismaClient;

  // TODO create include if need
  static async queryGroups({
    cursor,
    filter,
    sort,
    first,
  }: GqlQueryGroupsArgs): Promise<GqlGroupsConnection> {
    const take = first ?? 10;
    const where: Prisma.GroupWhereInput = {
      AND: [
        filter?.agendaId
          ? { agendas: { some: { agendaId: filter?.agendaId } } }
          : {},
        filter?.organizationId
          ? { organizationId: filter?.organizationId }
          : {},
        filter?.keyword
          ? {
              OR: [
                { name: { contains: filter?.keyword } },
                { bio: { contains: filter?.keyword } },
              ],
            }
          : {},
      ],
    };
    const orderBy: Prisma.GroupOrderByWithRelationInput[] = [
      { createdAt: sort?.createdAt ?? Prisma.SortOrder.desc },
      { updatedAt: sort?.updatedAt ?? Prisma.SortOrder.desc },
    ];

    const data = await this.db.group.findMany({
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

  // TODO why need as GqlGroup
  static async getGroup({ id }: GqlQueryGroupArgs): Promise<GqlGroup | null> {
    return (await this.db.group.findUnique({
      where: { id },
      include: {
        parent: true,
        organization: true,
      },
    })) as GqlGroup | null;
  }

  static async createGroup({
    content,
  }: GqlMutationCreateGroupArgs): Promise<GqlGroup> {
    const { userIds, agendaIds, parentId, organizationId, ...properties } =
      content;

    const data: Prisma.GroupCreateInput = {
      ...properties,
      users: {
        create: userIds?.map((userId) => ({ userId })),
      },
      agendas: {
        create: agendaIds?.map((agendaId) => ({ agendaId })),
      },
      parent: {
        connect: { id: parentId },
      },
      organization: {
        connect: { id: organizationId },
      },
    };

    return this.db.group.create({
      data,
    });
  }

  static async updateGroup({
    id,
    content,
  }: GqlMutationUpdateGroupArgs): Promise<GqlGroup> {
    return this.db.group.update({
      where: { id },
      data: content,
    });
  }

  static async deleteGroup({
    id,
  }: GqlMutationDeleteGroupArgs): Promise<GqlGroup> {
    return this.db.group.delete({
      where: { id },
    });
  }
}
