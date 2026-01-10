import { IncentiveGrantFailureCode, IncentiveGrantType, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  PrismaIncentiveGrantDetail,
  PrismaIncentiveGrantWithTransaction,
  StalePendingGrantResult,
} from "./type";

/**
 * Repository interface for IncentiveGrant operations
 */
export interface IIncentiveGrantRepository {
  /**
   * Create a new incentive grant
   */
  create(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    data: {
      userId: string;
      communityId: string;
      type: IncentiveGrantType;
      sourceId: string;
    }
  ): Promise<{ id: string }>;

  /**
   * Find an incentive grant by its unique constraint
   */
  findByUnique(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    data: {
      userId: string;
      communityId: string;
      type: IncentiveGrantType;
      sourceId: string;
    }
  ): Promise<PrismaIncentiveGrantWithTransaction | null>;

  /**
   * Find an incentive grant by ID
   */
  findById(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    id: string
  ): Promise<PrismaIncentiveGrantWithTransaction | null>;

  /**
   * Update an incentive grant to COMPLETED status with transaction
   */
  markAsCompleted(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    id: string,
    transactionId: string
  ): Promise<void>;

  /**
   * Update an incentive grant to FAILED status
   */
  markAsFailed(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    id: string,
    failureCode: IncentiveGrantFailureCode,
    lastError?: string
  ): Promise<void>;

  /**
   * Update an incentive grant to PENDING status
   */
  resetToPending(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    id: string
  ): Promise<void>;

  /**
   * Find stale PENDING grants
   */
  findStalePendingGrants(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    thresholdDate: Date
  ): Promise<StalePendingGrantResult[]>;

  /**
   * Find signup bonus grants
   */
  find(
    ctx: IContext,
    where: Prisma.IncentiveGrantWhereInput,
    orderBy: Prisma.IncentiveGrantOrderByWithRelationInput
  ): Promise<PrismaIncentiveGrantDetail[]>;
}
