import TransactionRepository from "@/application/transaction/data/repository";
import {
  GqlTransaction,
  GqlTransactionDonateSelfPointInput,
  GqlTransactionFilterInput,
  GqlTransactionGrantCommunityPointInput,
  GqlTransactionIssueCommunityPointInput,
  GqlTransactionsConnection,
  GqlTransactionSortInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import TransactionConverter, {
  GiveOnboardingPointParams,
  PurchaseTicketParams,
  RefundTicketParams,
} from "@/application/transaction/data/converter";
import { clampFirst } from "@/application/utils";
import TransactionPresenter from "@/application/transaction/presenter";

export default class TransactionService {
  static async fetchTransactions(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlTransactionFilterInput;
      sort?: GqlTransactionSortInput;
      first?: number;
    },
  ): Promise<GqlTransactionsConnection> {
    const take = clampFirst(first);

    const where = TransactionConverter.filter(filter ?? {});
    const orderBy = TransactionConverter.sort(sort ?? {});

    const res = await TransactionRepository.query(ctx, where, orderBy, take + 1, cursor);
    const hasNextPage = res.length > take;

    const data: GqlTransaction[] = res.slice(0, take).map((record) => {
      return TransactionPresenter.get(record);
    });

    return TransactionPresenter.query(data, hasNextPage);
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

  static async giveOnboardingPoint(
    ctx: IContext,
    params: GiveOnboardingPointParams,
    tx: Prisma.TransactionClient,
  ) {
    const data = TransactionConverter.giveOnboardingPoint(params);

    const res = await TransactionRepository.create(ctx, data, tx);
    await TransactionRepository.refreshCurrentPoints(ctx, tx);
    return res;
  }

  static async giveRewardPoint(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    participationId: string,
    pointsToEarn: number,
    fromWalletId: string,
    toWalletId: string,
  ) {
    const fromPointChange = -pointsToEarn;
    const toPointChange = pointsToEarn;

    const data: Prisma.TransactionCreateInput = TransactionConverter.giveRewardPoint({
      fromWalletId,
      fromPointChange,
      toWalletId,
      toPointChange,
      participationId,
    });

    const res = await TransactionRepository.create(ctx, data, tx);
    await TransactionRepository.refreshCurrentPoints(ctx, tx);
    return res;
  }

  static async purchaseTicket(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    params: PurchaseTicketParams,
  ) {
    const data: Prisma.TransactionCreateInput = TransactionConverter.purchaseTicket(params);

    const res = await TransactionRepository.create(ctx, data, tx);
    await TransactionRepository.refreshCurrentPoints(ctx, tx);
    return res;
  }

  static async refundTicket(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    params: RefundTicketParams,
  ) {
    const data: Prisma.TransactionCreateInput = TransactionConverter.refundTicket(params);

    const res = await TransactionRepository.create(ctx, data, tx);
    await TransactionRepository.refreshCurrentPoints(ctx, tx);
    return res;
  }
}
