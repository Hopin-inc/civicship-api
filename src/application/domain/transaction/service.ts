import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  ITransactionRepository,
  ITransactionService,
} from "@/application/domain/transaction/data/interface";
import TransactionConverter from "@/application/domain/transaction/data/converter";
import { PrismaTransactionDetail } from "@/application/domain/transaction/data/type";
import {
  GqlQueryTransactionsArgs,
  GqlTransactionGrantCommunityPointInput,
  GqlTransactionIssueCommunityPointInput,
} from "@/types/graphql";
import { inject, injectable } from "tsyringe";

@injectable()
export default class TransactionService implements ITransactionService {
  constructor(
    @inject("TransactionRepository") private readonly repository: ITransactionRepository,
    @inject("TransactionConverter") private readonly converter: TransactionConverter,
  ) {}

  async fetchTransactions(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryTransactionsArgs,
    take: number,
  ): Promise<PrismaTransactionDetail[]> {
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});

    return this.repository.query(ctx, where, orderBy, take, cursor);
  }

  async findTransaction(ctx: IContext, id: string): Promise<PrismaTransactionDetail | null> {
    return this.repository.find(ctx, id);
  }

  async issueCommunityPoint(
    ctx: IContext,
    input: GqlTransactionIssueCommunityPointInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTransactionDetail> {
    const data = this.converter.issueCommunityPoint(input);
    const res = await this.repository.create(ctx, data, tx);
    await this.repository.refreshCurrentPoints(ctx, tx);
    return res;
  }

  async grantCommunityPoint(
    ctx: IContext,
    input: GqlTransactionGrantCommunityPointInput,
    memberWalletId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTransactionDetail> {
    const data = this.converter.grantCommunityPoint(input, memberWalletId);
    const res = await this.repository.create(ctx, data, tx);
    await this.repository.refreshCurrentPoints(ctx, tx);
    return res;
  }

  async donateSelfPoint(
    ctx: IContext,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTransactionDetail> {
    const data = this.converter.donateSelfPoint(fromWalletId, toWalletId, transferPoints);
    const transaction = await this.repository.create(ctx, data, tx);
    await this.repository.refreshCurrentPoints(ctx, tx);
    return transaction;
  }

  async giveRewardPoint(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    participationId: string,
    transferPoints: number,
    fromWalletId: string,
    toWalletId: string,
  ): Promise<PrismaTransactionDetail> {
    const data = this.converter.giveRewardPoint(
      fromWalletId,
      toWalletId,
      participationId,
      transferPoints,
    );
    const res = await this.repository.create(ctx, data, tx);
    await this.repository.refreshCurrentPoints(ctx, tx);
    return res;
  }

  async purchaseTicket(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
  ): Promise<PrismaTransactionDetail> {
    const data = this.converter.purchaseTicket(fromWalletId, toWalletId, transferPoints);
    const res = await this.repository.create(ctx, data, tx);
    await this.repository.refreshCurrentPoints(ctx, tx);
    return res;
  }

  async refundTicket(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
  ): Promise<PrismaTransactionDetail> {
    const data = this.converter.refundTicket(fromWalletId, toWalletId, transferPoints);
    const res = await this.repository.create(ctx, data, tx);
    await this.repository.refreshCurrentPoints(ctx, tx);
    return res;
  }
}
