import { IContext } from "@/types/server";
import {
  GqlParticipationStatusHistoriesConnection,
  GqlParticipationStatusHistory,
  GqlParticipationStatusHistoryFilterInput,
  GqlParticipationStatusHistorySortInput,
} from "@/types/graphql";
import ParticipationStatusHistoryRepository from "@/application/domain/participation/statusHistory/data/repository";
import ParticipationStatusHistoryConverter from "@/application/domain/participation/statusHistory/data/converter";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import ParticipationStatusHistoryPresenter from "@/application/domain/participation/statusHistory/presenter";
import { ParticipationStatus, ParticipationStatusReason, Prisma } from "@prisma/client";

export default class ParticipationStatusHistoryService {
  static async fetchParticipationStatusHistories(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlParticipationStatusHistoryFilterInput;
      sort?: GqlParticipationStatusHistorySortInput;
      first?: number;
    },
  ): Promise<GqlParticipationStatusHistoriesConnection> {
    const take = clampFirst(first);

    const where = ParticipationStatusHistoryConverter.filter(filter);
    const orderBy = ParticipationStatusHistoryConverter.sort(sort ?? {});

    const res = await ParticipationStatusHistoryRepository.query(ctx, where, orderBy, take, cursor);

    const hasNextPage = res.length > take;
    const data: GqlParticipationStatusHistory[] = res
      .slice(0, take)
      .map((record) => ParticipationStatusHistoryPresenter.get(record));

    return ParticipationStatusHistoryPresenter.query(data, hasNextPage);
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
