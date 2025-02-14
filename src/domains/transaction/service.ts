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
import MembershipUtils from "@/domains/membership/utils";
import { PrismaClientIssuer } from "@/prisma/client";

export default class TransactionService {
  private static issuer = new PrismaClientIssuer();

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
    await TransactionRepository.refreshStat(ctx, tx);
    return res;
  }

  static async issueCommunityPoint(ctx: IContext, input: GqlTransactionIssueCommunityPointInput) {
    const data: Prisma.TransactionCreateInput = TransactionInputFormat.issueCommunityPoint(input);

    const res = await TransactionRepository.create(ctx, data);
    await TransactionRepository.refreshStat(ctx);
    return res;
  }

  static async grantCommunityPoint(ctx: IContext, input: GqlTransactionGrantCommunityPointInput) {
    return this.issuer.public(ctx, async (tx) => {
      const { wallet } = await MembershipUtils.joinCommunityAndCreateMemberWallet(
        ctx,
        tx,
        input.toUserId,
        input.communityId,
      );
      const data: Prisma.TransactionCreateInput = TransactionInputFormat.grantCommunityPoint(
        input,
        wallet.id,
      );
      const res = await TransactionRepository.create(ctx, data, tx);
      await TransactionRepository.refreshStat(ctx, tx);

      return res;
    });
  }

  static async donateSelfPoint(ctx: IContext, input: GqlTransactionDonateSelfPointInput) {
    return this.issuer.public(ctx, async (tx) => {
      const { wallet } = await MembershipUtils.joinCommunityAndCreateMemberWallet(
        ctx,
        tx,
        input.toUserId,
        input.communityId,
      );
      const data: Prisma.TransactionCreateInput = TransactionInputFormat.donateSelfPoint(
        input,
        wallet.id,
      );
      const res = await TransactionRepository.create(ctx, data, tx);
      await TransactionRepository.refreshStat(ctx, tx);

      return res;
    });
  }

  static async useUtility(ctx: IContext, input: GqlTransactionUseUtilityInput) {
    const data: Prisma.TransactionCreateInput = {
      ...input,
      reason: TransactionReason.UTILITY_USAGE,
    };

    const res = await TransactionRepository.create(ctx, data);
    await TransactionRepository.refreshStat(ctx);
    return res;
  }
}
