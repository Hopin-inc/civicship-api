import { IContext } from "@/types/server";
import {
  GqlParticipationStatusHistoriesConnection,
  GqlParticipationStatusHistory,
  GqlParticipationStatusHistoryFilterInput,
  GqlParticipationStatusHistorySortInput,
} from "@/types/graphql";
import ParticipationStatusHistoryRepository from "@/application/participation/statusHistory/data/repository";
import ParticipationStatusHistoryConverter from "@/application/participation/statusHistory/data/converter";
import { clampFirst, getCurrentUserId } from "@/application/utils";
import ParticipationStatusHistoryPresenter from "@/application/participation/statusHistory/presenter";
import { Prisma } from "@prisma/client";

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

  static async bulkCreateStatusHistoriesForCancelledOpportunity(
    ctx: IContext,
    participationIds: string[],
    tx: Prisma.TransactionClient,
  ) {
    const currentUserId = getCurrentUserId(ctx);

    const data =
      ParticipationStatusHistoryConverter.bulkCreateStatusHistoriesForCancelledOpportunity(
        participationIds,
        currentUserId,
      );

    return await ParticipationStatusHistoryRepository.createMany(ctx, data, tx);
  }
}
