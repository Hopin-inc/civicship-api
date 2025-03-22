import { prismaClient, PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { userInclude } from "@/application/user/data/type";

export default class UserRepository {
  private static db = prismaClient;
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.UserWhereInput,
    orderBy: Prisma.UserOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.user.findMany({
        where,
        orderBy,
        include: userInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.user.findUnique({
        where: { id },
        include: userInclude,
      });
    });
  }

  static async updateProfile(
    ctx: IContext,
    id: string,
    data: Prisma.UserUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.user.update({
      where: { id },
      data,
      include: userInclude,
    });
  }

  static async createWithIdentity(data: Prisma.UserCreateInput) {
    return this.db.user.create({
      data,
      include: {
        identities: true,
      },
    });
  }

  static async deleteWithIdentity(id: string) {
    return this.db.user.delete({
      where: { id },
      include: {
        identities: true,
      },
    });
  }
}
