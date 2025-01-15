import { PrismaClientIssuer } from "@/prisma/client";
import { refreshMaterializedViewCurrentPoints } from "@prisma/client/sql";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

export default class TransactionRepository {
  private static issuer = new PrismaClientIssuer();

  static async refreshStat(ctx: IContext, tx: Prisma.TransactionClient) {
    return this.issuer.publicWithTransaction(ctx, tx, (transactionTx) => {
      return transactionTx.$queryRawTyped(refreshMaterializedViewCurrentPoints());
    });
  }

  static async createWithTransaction(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    data: Prisma.TransactionCreateInput,
  ) {
    return this.issuer.publicWithTransaction(ctx, tx, (transactionTx) => {
      return transactionTx.transaction.create({
        data,
      });
    });
  }
}
