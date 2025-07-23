import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  ITransactionRepository,
  ITransactionService,
} from "@/application/domain/transaction/data/interface";
import TransactionConverter from "@/application/domain/transaction/data/converter";
import { PrismaTransactionDetail } from "@/application/domain/transaction/data/type";
import { GqlQueryTransactionsArgs } from "@/types/graphql";
import { getCurrentUserId } from "@/application/domain/utils";
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
    transferPoints: number,
    toWalletId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTransactionDetail> {
    const currentUserId = getCurrentUserId(ctx);
    const data = this.converter.issueCommunityPoint(toWalletId, transferPoints, currentUserId);
    const res = await this.repository.create(ctx, data, tx);
    await this.repository.refreshCurrentPoints(ctx, tx);
    return res;
  }

  async grantCommunityPoint(
    ctx: IContext,
    transferPoints: number,
    fromWalletId: string,
    memberWalletId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTransactionDetail> {
    const currentUserId = getCurrentUserId(ctx);
    const data = this.converter.grantCommunityPoint(fromWalletId, transferPoints, memberWalletId, currentUserId);
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
    const currentUserId = getCurrentUserId(ctx);
    const data = this.converter.donateSelfPoint(fromWalletId, toWalletId, transferPoints, currentUserId);
    const transaction = await this.repository.create(ctx, data, tx);
    await this.repository.refreshCurrentPoints(ctx, tx);
    return transaction;
  }

  async reservationCreated(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
    reservationId: string,
  ): Promise<PrismaTransactionDetail> {
    const currentUserId = getCurrentUserId(ctx);
    const data = this.converter.reservationCreated(fromWalletId, toWalletId, transferPoints, currentUserId, reservationId);
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
    const currentUserId = getCurrentUserId(ctx);
    const data = this.converter.giveRewardPoint(
      fromWalletId,
      toWalletId,
      participationId,
      transferPoints,
      currentUserId,
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
    const currentUserId = getCurrentUserId(ctx);
    const data = this.converter.purchaseTicket(fromWalletId, toWalletId, transferPoints, currentUserId);
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
    const currentUserId = getCurrentUserId(ctx);
    const data = this.converter.refundTicket(fromWalletId, toWalletId, transferPoints, currentUserId);
    const res = await this.repository.create(ctx, data, tx);
    await this.repository.refreshCurrentPoints(ctx, tx);
    return res;
  }

  async refreshCurrentPoint(ctx: IContext, tx: Prisma.TransactionClient) {
    return this.repository.refreshCurrentPoints(ctx, tx);
  }
}
