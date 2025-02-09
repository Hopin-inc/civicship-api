import { PrismaClientIssuer } from "@/prisma/client";
import { refreshMaterializedViewCurrentPoints } from "@prisma/client/sql";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { transactionInclude } from "@/domains/transaction/type";

export default class TransactionRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.TransactionWhereInput,
    orderBy: Prisma.TransactionOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.transaction.findMany({
        where,
        orderBy,
        include: transactionInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.transaction.findUnique({
        where: { id },
        include: transactionInclude,
      });
    });
  }

  static async refreshStat(ctx: IContext, tx?: Prisma.TransactionClient) {
    if (tx) {
      return this.issuer.publicWithTransaction(ctx, tx, (transactionTx) => {
        return transactionTx.$queryRawTyped(refreshMaterializedViewCurrentPoints());
      });
    } else {
      return this.issuer.public(ctx, (transactionTx) => {
        return transactionTx.$queryRawTyped(refreshMaterializedViewCurrentPoints());
      });
    }
  }

  static async create(ctx: IContext, data: Prisma.TransactionCreateInput) {
    return this.issuer.public(ctx, (tx) => {
      return tx.transaction.create({
        data,
        include: transactionInclude,
      });
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
        include: transactionInclude,
      });
    });
  }
}
