import { ParticipationStatus, ParticipationStatusReason, Prisma } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class ParticipationStatusHistoryConverter {
  createMany(
    participationIds: string[],
    currentUserId: string,
    status: ParticipationStatus,
    reason: ParticipationStatusReason,
  ): Prisma.ParticipationStatusHistoryCreateManyInput[] {
    return participationIds.map((participationId) => ({
      participationId,
      status,
      reason,
      createdBy: currentUserId,
    }));
  }
}
