import { PrismaClientIssuer } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

export default class WalletRepository {
  private static issuer = new PrismaClientIssuer();

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.wallet.findUnique({
        where: { id },
      });
    });
  }

  static async create(ctx: IContext, data: Prisma.WalletCreateInput) {
    return this.issuer.public(ctx, (tx) => {
      return tx.wallet.create({
        data,
      });
    });
  }

  static async delete(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.wallet.delete({
        where: { id },
      });
    });
  }
}
