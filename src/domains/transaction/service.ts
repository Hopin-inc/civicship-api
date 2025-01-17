import TransactionRepository from "@/domains/transaction/repository";
import {
  GqlQueryTransactionsArgs,
  GqlTransactionGiveRewardPointInput,
  GqlTransactionDonateSelfPointInput,
  GqlTransactionGrantCommunityPointInput,
  GqlTransactionIssueCommunityPointInput,
  GqlTransactionUseUtilityInput,
} from "@/types/graphql";
import { Prisma, TransactionReason } from "@prisma/client";
import { IContext } from "@/types/server";
import TransactionInputFormat from "@/domains/transaction/presenter/input";

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

  static async giveRewardPoint(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    input: GqlTransactionGiveRewardPointInput,
  ) {
    const data: Prisma.TransactionCreateInput = {
      ...input,
      reason: TransactionReason.PARTICIPATION_APPROVED,
    };

    const res = await TransactionRepository.createWithTransaction(ctx, tx, data);
    // await TransactionRepository.refreshStat(ctx, tx);
    return res;
  }

  static async issueCommunityPoint(ctx: IContext, input: GqlTransactionIssueCommunityPointInput) {
    const data: Prisma.TransactionCreateInput = {
      ...input,
      reason: TransactionReason.POINT_ISSUED,
    };

    const res = await TransactionRepository.create(ctx, data);
    // await TransactionRepository.refreshStat(ctx, tx);
    return res;
  }

  static async grantCommunityPoint(ctx: IContext, input: GqlTransactionGrantCommunityPointInput) {
    const data: Prisma.TransactionCreateInput = {
      ...input,
      reason: TransactionReason.GIFT,
    };

    const res = await TransactionRepository.create(ctx, data);
    // await TransactionRepository.refreshStat(ctx, tx);
    return res;
  }

  static async donateSelfPoint(ctx: IContext, input: GqlTransactionDonateSelfPointInput) {
    const data: Prisma.TransactionCreateInput = {
      ...input,
      reason: TransactionReason.GIFT,
    };

    const res = await TransactionRepository.create(ctx, data);
    // await TransactionRepository.refreshStat(ctx, tx);
    return res;
  }

  static async useUtility(ctx: IContext, input: GqlTransactionUseUtilityInput) {
    const data: Prisma.TransactionCreateInput = {
      ...input,
      reason: TransactionReason.UTILITY_USAGE,
    };

    const res = await TransactionRepository.create(ctx, data);
    // await TransactionRepository.refreshStat(ctx, tx);
    return res;
  }
}
