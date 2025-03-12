import TransactionRepository from "@/application/transaction/data/repository";
import {
  GqlQueryTransactionsArgs,
  GqlTransactionDonateSelfPointInput,
  GqlTransactionGrantCommunityPointInput,
  GqlTransactionIssueCommunityPointInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import TransactionConverter, {
  GiveRewardPointParams,
  PurchaseUtilityParams,
  RefundUtilityParams,
} from "@/application/transaction/data/converter";

export default class TransactionService {
  static async fetchTransactions(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryTransactionsArgs,
    take: number,
  ) {
    const where = TransactionConverter.filter(filter ?? {});
    const orderBy = TransactionConverter.sort(sort ?? {});

    return await TransactionRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findTransaction(ctx: IContext, id: string) {
    return await TransactionRepository.find(ctx, id);
  }

  static async issueCommunityPoint(ctx: IContext, input: GqlTransactionIssueCommunityPointInput) {
    const data: Prisma.TransactionCreateInput = TransactionConverter.issueCommunityPoint(input);

    const res = await TransactionRepository.create(ctx, data);
    await TransactionRepository.refreshCurrentPoints(ctx);
    return res;
  }

  static async grantCommunityPoint(
    ctx: IContext,
    input: GqlTransactionGrantCommunityPointInput,
    memberWalletId: string,
    tx: Prisma.TransactionClient,
  ) {
    const data = TransactionConverter.grantCommunityPoint(input, memberWalletId);
    const transaction = await TransactionRepository.create(ctx, data, tx);
    await TransactionRepository.refreshCurrentPoints(ctx, tx);

    return transaction;
  }

  static async donateSelfPoint(
    ctx: IContext,
    input: GqlTransactionDonateSelfPointInput,
    toWalletId: string,
    tx: Prisma.TransactionClient,
  ) {
    const data = TransactionConverter.donateSelfPoint(input, toWalletId);
    const transaction = await TransactionRepository.create(ctx, data, tx);
    await TransactionRepository.refreshCurrentPoints(ctx, tx);
    return transaction;
  }

  static async giveRewardPoint(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    params: GiveRewardPointParams,
  ) {
    const data: Prisma.TransactionCreateInput = TransactionConverter.giveRewardPoint(params);

    const res = await TransactionRepository.create(ctx, data, tx);
    await TransactionRepository.refreshCurrentPoints(ctx, tx);
    return res;
  }

  static async purchaseUtility(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    params: PurchaseUtilityParams,
  ) {
    const data: Prisma.TransactionCreateInput = TransactionConverter.purchaseUtility(params);

    const res = await TransactionRepository.create(ctx, data, tx);
    await TransactionRepository.refreshCurrentPoints(ctx, tx);
    return res;
  }

  static async refundUtility(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    params: RefundUtilityParams,
  ) {
    const data: Prisma.TransactionCreateInput = TransactionConverter.refundUtility(params);

    const res = await TransactionRepository.create(ctx, data, tx);
    await TransactionRepository.refreshCurrentPoints(ctx, tx);
    return res;
  }
}
