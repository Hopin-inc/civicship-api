import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma } from "@prisma/client";
import { communityInclude } from "@/application/domain/account/community/data/type";
import { IContext } from "@/types/server";

export default class CommunityRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.CommunityWhereInput,
    orderBy: Prisma.CommunityOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.community.findMany({
        where,
        orderBy,
        include: communityInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.community.findUnique({
        where: { id },
        include: communityInclude,
      });
    });
  }

  static async create(
    ctx: IContext,
    data: Prisma.CommunityCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.community.create({
      data,
      include: communityInclude,
    });
  }

  static async delete(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.community.delete({
        where: { id },
        include: communityInclude,
      });
    });
  }

  static async update(ctx: IContext, id: string, data: Prisma.CommunityUpdateInput) {
    return this.issuer.public(ctx, (tx) => {
      return tx.community.update({
        where: { id },
        data,
        include: communityInclude,
      });
    });
  }
}
