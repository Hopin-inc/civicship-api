import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { IParticipationStatusHistoryRepository } from "@/application/domain/experience/participation/statusHistory/data/interface";
import { getCurrentUserId } from "@/application/domain/utils";
import { ParticipationStatus, ParticipationStatusReason, Prisma } from "@prisma/client";
import ParticipationStatusHistoryConverter from "@/application/domain/experience/participation/statusHistory/data/converter";

@injectable()
export default class ParticipationStatusHistoryService {
  constructor(
    @inject("ParticipationStatusHistoryRepository")
    private readonly repository: IParticipationStatusHistoryRepository,
    private readonly converter: ParticipationStatusHistoryConverter,
  ) {}

  async bulkCreateStatusHistoriesForCancelledOpportunitySlot(
    ctx: IContext,
    participationIds: string[],
    tx: Prisma.TransactionClient,
  ) {
    const currentUserId = getCurrentUserId(ctx);
    const data = this.converter.createMany(
      participationIds,
      currentUserId,
      ParticipationStatus.NOT_PARTICIPATING,
      ParticipationStatusReason.OPPORTUNITY_CANCELED,
    );

    return await this.repository.createMany(ctx, data, tx);
  }

  async bulkCreateStatusHistoriesForReservationStatusChanged(
    ctx: IContext,
    participationIds: string[],
    status: ParticipationStatus,
    reason: ParticipationStatusReason,
    tx?: Prisma.TransactionClient,
  ) {
    const currentUserId = getCurrentUserId(ctx);
    const data = this.converter.createMany(participationIds, currentUserId, status, reason);

    return await this.repository.createMany(ctx, data, tx);
  }
}
