import { IncentiveGrantFailureCode, IncentiveGrantStatus, IncentiveGrantType, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { IIncentiveGrantRepository } from "./interface";
import { injectable } from "tsyringe";
import { transactionSelectDetail } from "@/application/domain/transaction/data/type";
import {
  incentiveGrantSelectDetail,
  PrismaIncentiveGrantDetail,
  PrismaIncentiveGrantWithTransaction,
  StalePendingGrantResult,
} from "./type";

@injectable()
export default class IncentiveGrantRepository implements IIncentiveGrantRepository {
  async create(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    data: {
      userId: string;
      communityId: string;
      type: IncentiveGrantType;
      sourceId: string;
    }
  ): Promise<{ id: string }> {
    const grant = await tx.incentiveGrant.create({
      data: {
        userId: data.userId,
        communityId: data.communityId,
        type: data.type,
        sourceId: data.sourceId,
        status: IncentiveGrantStatus.PENDING,
      },
      select: {
        id: true,
      },
    });

    return grant;
  }

  async findByUnique(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    data: {
      userId: string;
      communityId: string;
      type: IncentiveGrantType;
      sourceId: string;
    }
  ): Promise<PrismaIncentiveGrantWithTransaction | null> {
    return tx.incentiveGrant.findUnique({
      where: {
        unique_incentive_grant: {
          userId: data.userId,
          communityId: data.communityId,
          type: data.type,
          sourceId: data.sourceId,
        },
      },
      include: {
        transaction: {
          select: transactionSelectDetail,
        },
      },
    });
  }

  async findById(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    id: string
  ): Promise<PrismaIncentiveGrantWithTransaction | null> {
    return tx.incentiveGrant.findUnique({
      where: { id },
      include: {
        transaction: {
          select: transactionSelectDetail,
        },
      },
    });
  }

  async markAsCompleted(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    id: string,
    transactionId: string
  ): Promise<void> {
    await tx.incentiveGrant.update({
      where: { id },
      data: {
        status: IncentiveGrantStatus.COMPLETED,
        transactionId,
        failureCode: null,
        lastError: null,
      },
    });
  }

  async markAsFailed(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    id: string,
    failureCode: IncentiveGrantFailureCode,
    lastError?: string
  ): Promise<void> {
    await tx.incentiveGrant.update({
      where: { id },
      data: {
        status: IncentiveGrantStatus.FAILED,
        failureCode,
        lastError: lastError?.substring(0, 5000), // Limit length
        lastAttemptedAt: new Date(),
      },
    });
  }

  async resetToPending(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    id: string
  ): Promise<void> {
    await tx.incentiveGrant.update({
      where: { id },
      data: {
        status: IncentiveGrantStatus.PENDING,
        attemptCount: { increment: 1 },
        lastAttemptedAt: new Date(),
      },
    });
  }

  async findStalePendingGrants(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    thresholdDate: Date
  ): Promise<StalePendingGrantResult[]> {
    return tx.incentiveGrant.findMany({
      where: {
        status: IncentiveGrantStatus.PENDING,
        lastAttemptedAt: { lt: thresholdDate },
      },
      select: {
        id: true,
        userId: true,
        communityId: true,
        attemptCount: true,
        lastAttemptedAt: true,
        createdAt: true,
      },
      orderBy: {
        lastAttemptedAt: "asc", // oldest first
      },
    });
  }

  async find(
    ctx: IContext,
    where: Prisma.IncentiveGrantWhereInput,
    orderBy: Prisma.IncentiveGrantOrderByWithRelationInput
  ): Promise<PrismaIncentiveGrantDetail[]> {
    return ctx.issuer.internal(async (tx) =>
      tx.incentiveGrant.findMany({
        where,
        select: incentiveGrantSelectDetail,
        orderBy,
      }),
    );
  }
}
