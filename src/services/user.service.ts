import {
  GqlMutationCreateUserArgs,
  GqlMutationDeleteUserArgs,
  GqlMutationUpdateUserArgs,
  GqlQueryUserArgs,
  GqlQueryUsersArgs,
  GqlUser,
  GqlUsersConnection,
} from "@/types/graphql";
import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";

export default class UserService {
  private static db = prismaClient;

  // #ToDo add skill in filter
  static async queryUsers({
    cursor,
    filter,
    sort,
    first,
  }: GqlQueryUsersArgs): Promise<GqlUsersConnection> {
    const take = first ?? 10;
    const where: Prisma.UserWhereInput = {
      AND: [
        filter?.agendaId
          ? { agendas: { some: { agendaId: filter?.agendaId } } }
          : {},
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
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      updatedAt: sort?.updatedAt ?? Prisma.SortOrder.desc,
    };

    const data = await this.db.user.findMany({
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

  static async getUser({ id }: GqlQueryUserArgs): Promise<GqlUser | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  static async createUser({
    content,
  }: GqlMutationCreateUserArgs): Promise<GqlUser> {
    const { organizationIds, agendaIds, cityCodes, ...properties } = content;
    const data: Prisma.UserCreateInput = {
      ...properties,
      organizations: {
        create: organizationIds?.map((organizationId) => ({ organizationId })),
      },
      agendas: {
        create: agendaIds?.map((agendaId) => ({ agendaId })),
      },
      cities: {
        create: cityCodes?.map((cityCode) => ({ cityCode })),
      },
    };
    return this.db.user.create({ data });
  }

  static async updateUser({
    id,
    content,
  }: GqlMutationUpdateUserArgs): Promise<GqlUser> {
    return this.db.user.update({
      where: { id },
      data: content,
    });
  }

  static async deleteUser({ id }: GqlMutationDeleteUserArgs): Promise<GqlUser> {
    return this.db.user.delete({ where: { id } });
  }
}
