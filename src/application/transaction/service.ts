import TransactionRepository from "@/application/transaction/data/repository";
import {
  GqlQueryTransactionsArgs,
  GqlTransactionGiveRewardPointInput,
  GqlTransactionIssueCommunityPointInput,
  GqlTransactionPurchaseUtilityInput,
  GqlTransactionRefundUtilityInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import TransactionInputFormat from "@/application/transaction/data/converter";

export default class TransactionService {
  static async fetchTransactions(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryTransactionsArgs,
    take: number,
  ) {
    const where = TransactionInputFormat.filter(filter ?? {});
    const orderBy = TransactionInputFormat.sort(sort ?? {});

    return await TransactionRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findTransaction(ctx: IContext, id: string) {
    return await TransactionRepository.find(ctx, id);
  }

  static async findExistingTransaction(ctx: IContext, id: string) {
    return await TransactionRepository.find(ctx, id);
  }

  static async giveRewardPoint(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    input: GqlTransactionGiveRewardPointInput,
  ) {
    const data: Prisma.TransactionCreateInput = TransactionInputFormat.giveRewardPoint(input);

    const res = await TransactionRepository.create(ctx, data, tx);
    await TransactionRepository.refreshCurrentPoints(ctx, tx);
    return res;
  }

  static async issueCommunityPoint(ctx: IContext, input: GqlTransactionIssueCommunityPointInput) {
    const data: Prisma.TransactionCreateInput = TransactionInputFormat.issueCommunityPoint(input);

    const res = await TransactionRepository.create(ctx, data);
    await TransactionRepository.refreshCurrentPoints(ctx);
    return res;
  }

  static async purchaseUtility(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    input: GqlTransactionPurchaseUtilityInput,
  ) {
    const data: Prisma.TransactionCreateInput = TransactionInputFormat.purchaseUtility(input);

    const res = await TransactionRepository.create(ctx, data, tx);
    await TransactionRepository.refreshCurrentPoints(ctx, tx);
    return res;
  }

  static async refundUtility(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    input: GqlTransactionRefundUtilityInput,
  ) {
    const data: Prisma.TransactionCreateInput = TransactionInputFormat.refundUtility(input);

    const res = await TransactionRepository.create(ctx, data, tx);
    await TransactionRepository.refreshCurrentPoints(ctx, tx);
    return res;
  }
}
