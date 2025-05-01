import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaTransaction } from "@/application/domain/transaction/data/type";
import { refreshMaterializedViewCurrentPoints } from "@prisma/client/sql";
import {
  GqlQueryTransactionsArgs,
  GqlTransactionGrantCommunityPointInput,
  GqlTransactionIssueCommunityPointInput,
} from "@/types/graphql";

export interface ITransactionService {
  fetchTransactions(
    ctx: IContext,
    args: GqlQueryTransactionsArgs,
    take: number,
  ): Promise<PrismaTransaction[]>;
  findTransaction(ctx: IContext, id: string): Promise<PrismaTransaction | null>;
  issueCommunityPoint(
    ctx: IContext,
    input: GqlTransactionIssueCommunityPointInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTransaction>;
  grantCommunityPoint(
    ctx: IContext,
    input: GqlTransactionGrantCommunityPointInput,
    memberWalletId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTransaction>;
  donateSelfPoint(
    ctx: IContext,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTransaction>;
  giveRewardPoint(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    participationId: string,
    transferPoints: number,
    fromWalletId: string,
    toWalletId: string,
  ): Promise<PrismaTransaction>;
  purchaseTicket(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
  ): Promise<PrismaTransaction>;
  refundTicket(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
  ): Promise<PrismaTransaction>;
}

export interface ITransactionRepository {
  query(
    ctx: IContext,
    where: Prisma.TransactionWhereInput,
    orderBy: Prisma.TransactionOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaTransaction[]>;

  find(ctx: IContext, id: string): Promise<PrismaTransaction | null>;

  refreshCurrentPoints(
    ctx: IContext,
    tx: Prisma.TransactionClient,
  ): Promise<refreshMaterializedViewCurrentPoints.Result[]>;

  create(
    ctx: IContext,
    data: Prisma.TransactionCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTransaction>;
}
