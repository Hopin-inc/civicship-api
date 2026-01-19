import { IncentiveGrantType, Prisma } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class IncentiveGrantConverter {
  /**
   * Convert params to create input for new incentive grant in PENDING status.
   * Used for idempotent grant creation with unique constraint.
   */
  createPending(params: {
    userId: string;
    communityId: string;
    type: IncentiveGrantType;
    sourceId: string;
  }): Prisma.IncentiveGrantUncheckedCreateInput {
    return {
      userId: params.userId,
      communityId: params.communityId,
      type: params.type,
      sourceId: params.sourceId,
      status: "PENDING",
      attemptCount: 1,
      lastAttemptedAt: new Date(),
    };
  }
}
