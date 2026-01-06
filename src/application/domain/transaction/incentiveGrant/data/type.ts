import { IncentiveGrantFailureCode, IncentiveGrantStatus, Prisma } from "@prisma/client";
import { PrismaTransactionDetail } from "@/application/domain/transaction/data/type";

/**
 * Prisma validator for selecting incentive grant fields
 */
export const incentiveGrantSelectDetail = Prisma.validator<Prisma.IncentiveGrantSelect>()({
  id: true,
  userId: true,
  communityId: true,
  type: true,
  sourceId: true,
  status: true,
  transactionId: true,
  failureCode: true,
  lastError: true,
  attemptCount: true,
  lastAttemptedAt: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Type for the incentive grant object returned by the repository methods
 */
export type PrismaIncentiveGrantDetail = Prisma.IncentiveGrantGetPayload<{
  select: typeof incentiveGrantSelectDetail;
}>;

/**
 * Type for the incentive grant object with transaction included
 */
export type PrismaIncentiveGrantWithTransaction = {
  id: string;
  status: IncentiveGrantStatus;
  transactionId: string | null;
  transaction: PrismaTransactionDetail | null;
  failureCode: IncentiveGrantFailureCode | null;
  lastError: string | null;
  lastAttemptedAt: Date;
  attemptCount: number;
};

/**
 * Type for the result of the findStalePendingGrants method
 */
export type StalePendingGrantResult = {
  id: string;
  userId: string;
  communityId: string;
  attemptCount: number;
  lastAttemptedAt: Date;
  createdAt: Date;
};