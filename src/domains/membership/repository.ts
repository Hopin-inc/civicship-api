import { PrismaClientIssuer } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

export default class MembershipRepository {
  private static issuer = new PrismaClientIssuer();

  static async find(ctx: IContext, where: Prisma.MembershipWhereUniqueInput) {
    return this.issuer.public(ctx, (tx) => {
      return tx.membership.findUnique({
        where,
      });
    });
  }

  static async create(ctx: IContext, data: Prisma.MembershipCreateInput) {
    return this.issuer.public(ctx, (tx) => {
      return tx.membership.create({
        data,
      });
    });
  }

  static async delete(ctx: IContext, where: Prisma.MembershipWhereUniqueInput) {
    return this.issuer.public(ctx, (tx) => {
      return tx.membership.delete({
        where,
      });
    });
  }
}
