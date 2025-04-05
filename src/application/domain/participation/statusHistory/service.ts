import { IContext } from "@/types/server";
import { GqlQueryParticipationStatusHistoriesArgs } from "@/types/graphql";
import ParticipationStatusHistoryRepository from "@/application/domain/participation/statusHistory/data/repository";
import ParticipationStatusHistoryConverter from "@/application/domain/participation/statusHistory/data/converter";
import { getCurrentUserId } from "@/application/domain/utils";
import { ParticipationStatus, ParticipationStatusReason, Prisma } from "@prisma/client";

export default class ParticipationStatusHistoryService {
  static async fetchParticipationStatusHistories(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryParticipationStatusHistoriesArgs,
    take: number,
  ) {
    const where = ParticipationStatusHistoryConverter.filter(filter);
    const orderBy = ParticipationStatusHistoryConverter.sort(sort ?? {});

    return ParticipationStatusHistoryRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findParticipationStatusHistory(ctx: IContext, id: string) {
    return await ParticipationStatusHistoryRepository.find(ctx, id);
  }

  static async bulkCreateStatusHistoriesForCancelledOpportunitySlot(
    ctx: IContext,
    participationIds: string[],
    tx: Prisma.TransactionClient,
  ) {
    const currentUserId = getCurrentUserId(ctx);
    const data = ParticipationStatusHistoryConverter.createMany(
      participationIds,
      currentUserId,
      ParticipationStatus.NOT_PARTICIPATING,
      ParticipationStatusReason.OPPORTUNITY_CANCELED,
    );

    return await ParticipationStatusHistoryRepository.createMany(ctx, data, tx);
  }

  static async bulkCreateStatusHistoriesForReservationStatusChanged(
    ctx: IContext,
    participationIds: string[],
    status: ParticipationStatus,
    reason: ParticipationStatusReason,
    tx?: Prisma.TransactionClient,
  ) {
    const currentUserId = getCurrentUserId(ctx);
    const data = ParticipationStatusHistoryConverter.createMany(
      participationIds,
      currentUserId,
      status,
      reason,
    );

    return await ParticipationStatusHistoryRepository.createMany(ctx, data, tx);
  }
}
