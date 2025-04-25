import TransactionRepository from "@/application/domain/transaction/data/repository";
import {
  GqlQueryTransactionsArgs,
  GqlTransactionGrantCommunityPointInput,
  GqlTransactionIssueCommunityPointInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import TransactionConverter from "@/application/domain/transaction/data/converter";

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

    const res = await TransactionRepository.create(ctx, data, tx);
    await TransactionRepository.refreshCurrentPoints(ctx, tx);
    return res;
  }

  static async donateSelfPoint(
    ctx: IContext,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
    tx: Prisma.TransactionClient,
  ) {
    const data = TransactionConverter.donateSelfPoint(fromWalletId, toWalletId, transferPoints);

    const transaction = await TransactionRepository.create(ctx, data, tx);
    await TransactionRepository.refreshCurrentPoints(ctx, tx);
    return transaction;
  }

  static async giveRewardPoint(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    participationId: string,
    transferPoints: number,
    fromWalletId: string,
    toWalletId: string,
  ) {
    const data: Prisma.TransactionCreateInput = TransactionConverter.giveRewardPoint(
      fromWalletId,
      toWalletId,
      participationId,
      transferPoints,
    );

    const res = await TransactionRepository.create(ctx, data, tx);
    await TransactionRepository.refreshCurrentPoints(ctx, tx);
    return res;
  }

  static async purchaseTicket(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
  ) {
    const data: Prisma.TransactionCreateInput = TransactionConverter.purchaseTicket(
      fromWalletId,
      toWalletId,
      transferPoints,
    );

    const res = await TransactionRepository.create(ctx, data, tx);
    await TransactionRepository.refreshCurrentPoints(ctx, tx);
    return res;
  }

  static async refundTicket(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
  ) {
    const data: Prisma.TransactionCreateInput = TransactionConverter.refundTicket(
      fromWalletId,
      toWalletId,
      transferPoints,
    );

    const res = await TransactionRepository.create(ctx, data, tx);
    await TransactionRepository.refreshCurrentPoints(ctx, tx);
    return res;
  }
}
