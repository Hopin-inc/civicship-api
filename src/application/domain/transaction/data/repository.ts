import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { ITransactionRepository } from "@/application/domain/transaction/data/interface";
import { transactionSelectDetail, PrismaTransactionDetail } from "@/application/domain/transaction/data/type";
import {
  refreshMaterializedViewCurrentPoints,
  refreshMaterializedViewTransactionChains,
} from "@prisma/client/sql";
import { injectable } from "tsyringe";

@injectable()
export default class TransactionRepository implements ITransactionRepository {
  async query(
    ctx: IContext,
    where: Prisma.TransactionWhereInput,
    orderBy: Prisma.TransactionOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaTransactionDetail[]> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.transaction.findMany({
        where,
        orderBy,
        select: transactionSelectDetail,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  async find(ctx: IContext, id: string): Promise<PrismaTransactionDetail | null> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.transaction.findUnique({
        where: { id },
        select: transactionSelectDetail,
      });
    });
  }

  async refreshCurrentPoints(
    ctx: IContext,
    tx: Prisma.TransactionClient,
  ): Promise<refreshMaterializedViewCurrentPoints.Result[]> {
    return tx.$queryRawTyped(refreshMaterializedViewCurrentPoints());
  }

  async refreshTransactionChains(
    ctx: IContext,
    tx: Prisma.TransactionClient,
  ): Promise<refreshMaterializedViewTransactionChains.Result[]> {
    return tx.$queryRawTyped(refreshMaterializedViewTransactionChains());
  }

  async create(
    ctx: IContext,
    data: Prisma.TransactionCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTransactionDetail> {
    return tx.transaction.create({
      data,
      select: transactionSelectDetail,
    });
  }
}
