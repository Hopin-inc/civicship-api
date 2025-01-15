import TransactionRepository from "@/domains/transaction/repository";
import { GqlMutationTransactionCreateArgs, GqlTransactionCreateInput } from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { prismaClient } from "@/prisma/client";

export default class TransactionService {
  static async transferPointsWithTransaction(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    input: GqlTransactionCreateInput,
  ) {
    const data: Prisma.TransactionCreateInput = input;

    const res = await TransactionRepository.createWithTransaction(ctx, tx, data);
    await TransactionRepository.refreshStat(ctx, tx);
    return res;
  }

  static async transferPoints(ctx: IContext, { input }: GqlMutationTransactionCreateArgs) {
    const data: Prisma.TransactionCreateInput = input;
    return await prismaClient.$transaction(async (tx) => {
      const res = await TransactionRepository.createWithTransaction(ctx, tx, data);
      await TransactionRepository.refreshStat(ctx, tx);
      return res;
    });
  }
}
