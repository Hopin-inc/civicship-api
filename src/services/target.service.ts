import {
  GqlMutationCreateTargetArgs,
  GqlMutationDeleteTargetArgs,
  GqlMutationUpdateTargetArgs,
  GqlQueryTargetArgs,
  GqlTarget,
  GqlUpdateTargetPayload,
} from "@/types/graphql";
import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";

class TargetService {
  private static db = prismaClient;

  // static async queryTargets({
  //   cursor,
  //   filter,
  //   sort,
  //   first,
  // }: GqlQueryTargetsArgs) {
  //   const take = first ?? 10;
  //   const where: Prisma.TargetWhereInput = {
  //     AND: [
  //       filter?.agendaId
  //         ? { agendas: { some: { agendaId: filter?.agendaId } } }
  //         : {},
  //       filter?.keyword
  //         ? {
  //             OR: { name: { contains: filter?.keyword } },
  //           }
  //         : {},
  //     ],
  //   };
  //   const orderBy: Prisma.UserOrderByWithRelationInput = {
  //     updatedAt: sort?.updatedAt ?? Prisma.SortOrder.desc,
  //   };
  //
  //   const data = await this.db.user.findMany({
  //     where,
  //     orderBy,
  //     take: take + 1,
  //     skip: cursor ? 1 : 0,
  //     cursor: cursor ? { id: cursor } : undefined,
  //   });
  //   const hasNextPage = data.length > take;
  //   const formattedData = data.slice(0, take).map((record) => ({
  //     ...record,
  //   }));
  //   return {
  //     totalCount: data.length,
  //     pageInfo: {
  //       hasNextPage,
  //       hasPreviousPage: true,
  //       startCursor: formattedData[0]?.id,
  //       endCursor: formattedData.length
  //         ? formattedData[formattedData.length - 1].id
  //         : undefined,
  //     },
  //     edges: formattedData.map((edge) => ({
  //       cursor: edge.id,
  //       node: edge,
  //     })),
  //   };
  // }

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

  static async updateTarget({
    id,
    content,
  }: GqlMutationUpdateTargetArgs): Promise<GqlUpdateTargetPayload> {
    const { indexId, ...properties } = content;
    const data: Prisma.TargetUpdateInput = {
      ...properties,
      index: {
        connect: { id: indexId },
      },
    };
    const updatedTarget = await this.db.target.update({
      where: { id },
      data,
    });

    return {
      name: updatedTarget.name,
      value: updatedTarget.value,
      validFrom: updatedTarget.validFrom,
      validTo: updatedTarget.validTo,
      indexId: updatedTarget.indexId,
    };
  }
}

export default TargetService;
