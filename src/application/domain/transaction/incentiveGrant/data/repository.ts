import { IncentiveGrantFailureCode, IncentiveGrantType, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { injectable } from "tsyringe";
import { IIncentiveGrantRepository } from "./interface";
import { incentiveGrantSelect, PrismaIncentiveGrant } from "./type";

@injectable()
export default class IncentiveGrantRepository implements IIncentiveGrantRepository {
  async create(
    ctx: IContext,
    data: Prisma.IncentiveGrantUncheckedCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaIncentiveGrant> {
    return tx.incentiveGrant.create({
      data,
      select: incentiveGrantSelect,
    });
  }

  async markAsCompleted(
    ctx: IContext,
    userId: string,
    communityId: string,
    type: IncentiveGrantType,
    sourceId: string,
    transactionId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaIncentiveGrant> {
    return tx.incentiveGrant.update({
      where: {
        unique_incentive_grant: {
          userId,
          communityId,
          type,
          sourceId,
        },
      },
      data: {
        status: "COMPLETED",
        transactionId,
        updatedAt: new Date(),
      },
      select: incentiveGrantSelect,
    });
  }

  async markAsFailed(
    ctx: IContext,
    userId: string,
    communityId: string,
    type: IncentiveGrantType,
    sourceId: string,
    failureCode: IncentiveGrantFailureCode,
    lastError: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaIncentiveGrant> {
    return tx.incentiveGrant.update({
      where: {
        unique_incentive_grant: {
          userId,
          communityId,
          type,
          sourceId,
        },
      },
      data: {
        status: "FAILED",
        failureCode,
        lastError,
        attemptCount: { increment: 1 },
        lastAttemptedAt: new Date(),
        updatedAt: new Date(),
      },
      select: incentiveGrantSelect,
    });
  }
}
