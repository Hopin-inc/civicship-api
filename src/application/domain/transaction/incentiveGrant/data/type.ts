import { Prisma } from "@prisma/client";
import { communitySelectDetail } from "@/application/domain/account/community/data/type";
import { userSelectDetail } from "@/application/domain/account/user/data/type";

export const incentiveGrantSelect = Prisma.validator<Prisma.IncentiveGrantSelect>()({
  id: true,
  type: true,
  sourceId: true,
  status: true,
  userId: true,
  user: { select: userSelectDetail },
  communityId: true,
  community: { select: communitySelectDetail },
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
