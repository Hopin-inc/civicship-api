import TransactionRepository from "@/infrastructure/repositories/transaction";
import {
  GqlQueryTransactionsArgs,
  GqlTransactionGiveRewardPointInput,
  GqlTransactionIssueCommunityPointInput,
  GqlTransactionUseUtilityInput,
} from "@/types/graphql";
import { Prisma, TransactionReason } from "@prisma/client";
import { IContext } from "@/types/server";
import TransactionInputFormat from "@/presentation/graphql/dto/transaction/input";

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

  static async useUtility(ctx: IContext, input: GqlTransactionUseUtilityInput) {
    const data: Prisma.TransactionCreateInput = {
      ...input,
      reason: TransactionReason.UTILITY_USAGE,
    };

    const res = await TransactionRepository.create(ctx, data);
    await TransactionRepository.refreshCurrentPoints(ctx);
    return res;
  }
}
