import { Prisma, TransactionReason } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaTransactionDetail } from "@/application/domain/transaction/data/type";
import { refreshMaterializedViewCurrentPoints } from "@prisma/client/sql";
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

  retrySignupBonusGrant(
    ctx: IContext,
    args: {
      grantId: string;
      toWalletId: string;
      bonusPoint: number;
      message?: string;
    },
  ): Promise<Extract<import("./type").GrantSignupBonusResult, { status: "COMPLETED" | "FAILED" }>>;
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

  create(
    ctx: IContext,
    data: Prisma.TransactionCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTransactionDetail>;
}
