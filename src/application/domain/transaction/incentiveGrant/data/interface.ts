import { IContext } from "@/types/server";
import { IncentiveGrantFailureCode, IncentiveGrantType, Prisma } from "@prisma/client";
import { PrismaIncentiveGrant } from "./type";

export interface IIncentiveGrantRepository {
  /**
   * Query multiple incentive grants with filtering, sorting, and cursor-based pagination.
   */
  query(
    ctx: IContext,
    where: Prisma.IncentiveGrantWhereInput,
    orderBy: Prisma.IncentiveGrantOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaIncentiveGrant[]>;

  /**
   * Find a single incentive grant by ID.
   */
  find(ctx: IContext, id: string): Promise<PrismaIncentiveGrant | null>;

  /**
   * Find multiple incentive grants by IDs (for DataLoader batch loading).
   */
  findManyByIds(ctx: IContext, ids: string[]): Promise<PrismaIncentiveGrant[]>;

  /**
   * Create a new incentive grant record in PENDING status.
   * Idempotency: P2002 error will be thrown if duplicate unique constraint is violated.
   */
  create(
    ctx: IContext,
    data: Prisma.IncentiveGrantUncheckedCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaIncentiveGrant>;

  /**
   * Mark an incentive grant as COMPLETED with transaction reference.
   */
  markAsCompleted(
    ctx: IContext,
    userId: string,
    communityId: string,
    type: IncentiveGrantType,
    sourceId: string,
    transactionId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaIncentiveGrant>;

  /**
   * Mark an incentive grant as FAILED with error details.
   */
  markAsFailed(
    ctx: IContext,
    userId: string,
    communityId: string,
    type: IncentiveGrantType,
    sourceId: string,
    failureCode: IncentiveGrantFailureCode,
    lastError: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaIncentiveGrant>;
}
