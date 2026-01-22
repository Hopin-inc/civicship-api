import { Prisma } from "@prisma/client";

export const incentiveGrantSelect = Prisma.validator<Prisma.IncentiveGrantSelect>()({
  id: true,
  type: true,
  sourceId: true,
  status: true,

  userId: true,
  communityId: true,

  failureCode: true,
  lastError: true,
  attemptCount: true,
  lastAttemptedAt: true,
  transactionId: true,

  createdAt: true,
  updatedAt: true,
});

export type PrismaIncentiveGrant = Prisma.IncentiveGrantGetPayload<{
  select: typeof incentiveGrantSelect;
}>;
