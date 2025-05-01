import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import {
  GqlParticipationStatusHistoriesConnection,
  GqlParticipationStatusHistory,
  GqlParticipationStatusHistoryFilterInput,
  GqlParticipationStatusHistorySortInput,
} from "@/types/graphql";
import { IParticipationStatusHistoryRepository } from "@/application/domain/experience/participation/statusHistory/data/interface";
import ParticipationStatusHistoryPresenter from "@/application/domain/experience/participation/statusHistory/presenter";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import { ParticipationStatus, ParticipationStatusReason, Prisma } from "@prisma/client";
import ParticipationStatusHistoryConverter from "@/application/domain/experience/participation/statusHistory/data/converter";

@injectable()
export default class ParticipationStatusHistoryService {
  constructor(
    @inject("ParticipationStatusHistoryRepository")
    private readonly repository: IParticipationStatusHistoryRepository,
    private readonly converter: ParticipationStatusHistoryConverter,
  ) {}

  async fetchParticipationStatusHistories(
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
    const where = this.converter.filter(filter);
    const orderBy = this.converter.sort(sort ?? {});

    const res = await this.repository.query(ctx, where, orderBy, take, cursor);

    const hasNextPage = res.length > take;
    const data: GqlParticipationStatusHistory[] = res
      .slice(0, take)
      .map((record) => ParticipationStatusHistoryPresenter.get(record));

    return ParticipationStatusHistoryPresenter.query(data, hasNextPage);
  }

  async findParticipationStatusHistory(ctx: IContext, id: string) {
    return await this.repository.find(ctx, id);
  }

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
