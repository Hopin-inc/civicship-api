import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { utilityInclude } from "@/application/utility/infrastructure/type";

export default class UtilityRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.UtilityWhereInput,
    orderBy: Prisma.UtilityOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.utility.findMany({
        where,
        orderBy,
        include: utilityInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.utility.findUnique({
        where: { id },
        include: utilityInclude,
      });
    });
  }

  static async create(ctx: IContext, data: Prisma.UtilityCreateInput) {
    return this.issuer.public(ctx, (tx) => {
      return tx.utility.create({
        data,
        include: utilityInclude,
      });
    });
  }

  static async delete(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.utility.delete({
        where: { id },
        include: utilityInclude,
      });
    });
  }

  static async update(ctx: IContext, id: string, data: Prisma.UtilityUpdateInput) {
    return this.issuer.public(ctx, (tx) => {
      return tx.utility.update({
        where: { id },
        data,
        include: utilityInclude,
      });
    });
  }
}
