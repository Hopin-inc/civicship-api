import { Prisma, TransactionReason } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaTransactionDetail } from "@/application/domain/transaction/data/type";
import {
  refreshMaterializedViewCurrentPoints,
  refreshMaterializedViewTransactionChains,
} from "@prisma/client/sql";
import { GqlQueryTransactionsArgs } from "@/types/graphql";

export interface ITransactionService {
  fetchTransactions(
    ctx: IContext,
    args: GqlQueryTransactionsArgs,
    take: number,
  ): Promise<PrismaTransactionDetail[]>;

  findTransaction(ctx: IContext, id: string): Promise<PrismaTransactionDetail | null>;

  issueCommunityPoint(
    ctx: IContext,
    transferPoints: number,
    toWalletId: string,
    tx: Prisma.TransactionClient,
    comment?: string,
  ): Promise<PrismaTransactionDetail>;

  grantCommunityPoint(
    ctx: IContext,
    transferPoints: number,
    fromWalletId: string,
    memberWalletId: string,
    tx: Prisma.TransactionClient,
    comment?: string,
  ): Promise<PrismaTransactionDetail>;

  donateSelfPoint(
    ctx: IContext,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
    tx: Prisma.TransactionClient,
    comment?: string,
  ): Promise<PrismaTransactionDetail>;

  reservationCreated(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
    reservationId: string,
    reason: TransactionReason,
  ): Promise<PrismaTransactionDetail>;

  giveRewardPoint(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    participationId: string,
    transferPoints: number,
    fromWalletId: string,
    toWalletId: string,
  ): Promise<PrismaTransactionDetail>;

  purchaseTicket(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
  ): Promise<PrismaTransactionDetail>;

  refundTicket(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
  ): Promise<PrismaTransactionDetail>;

  refreshCurrentPoint(
    ctx: IContext,
    tx: Prisma.TransactionClient,
  ): Promise<refreshMaterializedViewCurrentPoints.Result[]>;
}

export interface ITransactionRepository {
  query(
    ctx: IContext,
    where: Prisma.TransactionWhereInput,
    orderBy: Prisma.TransactionOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaTransactionDetail[]>;

  find(ctx: IContext, id: string): Promise<PrismaTransactionDetail | null>;

  refreshCurrentPoints(
    ctx: IContext,
    tx: Prisma.TransactionClient,
  ): Promise<refreshMaterializedViewCurrentPoints.Result[]>;

  refreshTransactionChains(
    ctx: IContext,
    tx: Prisma.TransactionClient,
  ): Promise<refreshMaterializedViewTransactionChains.Result[]>;

  create(
    ctx: IContext,
    data: Prisma.TransactionCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTransactionDetail>;
}
