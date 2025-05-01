import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { ITransactionRepository } from "@/application/domain/transaction/data/interface";
import { transactionInclude } from "@/application/domain/transaction/data/type";
import { refreshMaterializedViewCurrentPoints } from "@prisma/client/sql";
import { injectable } from "tsyringe";

@injectable()
export default class TransactionRepository implements ITransactionRepository {
  async query(
    ctx: IContext,
    where: Prisma.TransactionWhereInput,
    orderBy: Prisma.TransactionOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return ctx.issuer.public(ctx, (tx) => {
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

  async find(ctx: IContext, id: string) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.transaction.findUnique({
        where: { id },
        include: transactionInclude,
      });
    });
  }

  async refreshCurrentPoints(ctx: IContext, tx: Prisma.TransactionClient) {
    return tx.$queryRawTyped(refreshMaterializedViewCurrentPoints());
  }

  async create(ctx: IContext, data: Prisma.TransactionCreateInput, tx: Prisma.TransactionClient) {
    return tx.transaction.create({
      data,
      include: transactionInclude,
    });
  }
}
