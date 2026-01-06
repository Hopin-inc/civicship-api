import { Prisma, IncentiveGrantFailureCode } from "@prisma/client";

export const transactionInclude = Prisma.validator<Prisma.TransactionInclude>()({
  fromWallet: true,
  toWallet: true,
  participation: true,
  createdByUser: true,
});

export const transactionSelectDetail = Prisma.validator<Prisma.TransactionSelect>()({
  id: true,
  reason: true,
  comment: true,
  fromPointChange: true,
  toPointChange: true,

  from: true,
  to: true,
  participationId: true,
  reservationId: true,

  createdBy: true,

  createdAt: true,
  updatedAt: true,
});

export type PrismaTransaction = Prisma.TransactionGetPayload<{
  include: typeof transactionInclude;
}>;

export type PrismaTransactionDetail = Prisma.TransactionGetPayload<{
  select: typeof transactionSelectDetail;
}>;

export type PrismaTransactionUnified = PrismaTransaction | PrismaTransactionDetail;

/**
 * Result type for grantSignupBonus method.
 * Uses discriminated union to represent different outcomes without throwing exceptions.
 */
export type GrantSignupBonusResult =
  | { status: "COMPLETED"; transaction: PrismaTransactionDetail }
  | { status: "SKIPPED_ALREADY_COMPLETED"; transaction: PrismaTransactionDetail }
  | { status: "SKIPPED_PENDING"; grantId: string }
  | {
      status: "FAILED";
      grantId: string;
      failureCode: IncentiveGrantFailureCode;
      lastError?: string;
    };
