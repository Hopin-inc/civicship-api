import {
  GqlParticipation,
  GqlParticipationFilterInput,
  GqlParticipationsConnection,
  GqlParticipationSortInput,
} from "@/types/graphql";
import { ParticipationStatus, ParticipationStatusReason, Prisma } from "@prisma/client";
import ParticipationConverter from "@/application/participation/data/converter";
import ParticipationRepository from "@/application/participation/data/repository";
import { IContext } from "@/types/server";
import { clampFirst, getCurrentUserId } from "@/application/utils";
import ParticipationPresenter from "@/application/participation/presenter";

export default class ParticipationService {
  static async fetchParticipations(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlParticipationFilterInput;
      sort?: GqlParticipationSortInput;
      first?: number;
    },
  ): Promise<GqlParticipationsConnection> {
    const take = clampFirst(first);

    const where = ParticipationConverter.filter(filter ?? {});
    const orderBy = ParticipationConverter.sort(sort ?? {});

    const res = await ParticipationRepository.query(ctx, where, orderBy, take, cursor);
    const hasNextPage = res.length > take;

    const data: GqlParticipation[] = res
      .slice(0, take)
      .map((record) => ParticipationPresenter.get(record));

    return ParticipationPresenter.query(data, hasNextPage);
  }

  static async fetchParticipationsByReservationId(ctx: IContext, id: string) {
    return await ParticipationRepository.queryByReservationId(ctx, id);
  }

  static async countActiveParticipantsBySlotId(ctx: IContext, slotId: string) {
    const where = ParticipationConverter.countActiveBySlotId(slotId);
    return await ParticipationRepository.count(ctx, where);
  }

  static async findParticipation(ctx: IContext, id: string) {
    return await ParticipationRepository.find(ctx, id);
  }

  static async findParticipationOrThrow(ctx: IContext, id: string) {
    const participation = await ParticipationRepository.find(ctx, id);
    if (!participation) {
      throw new Error(`ParticipationNotFound: ID=${id}`);
    }
    return participation;
  }

  static async setStatus(
    ctx: IContext,
    id: string,
    status: ParticipationStatus,
    reason: ParticipationStatusReason,
    currentUserId?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const userId = currentUserId ?? getCurrentUserId(ctx);

    const data: Prisma.ParticipationUpdateInput = ParticipationConverter.setStatus(
      userId,
      status,
      reason,
    );
    return ParticipationRepository.setStatus(ctx, id, data, tx);
  }

  static async bulkSetStatusByReservation(
    ctx: IContext,
    ids: string[],
    status: ParticipationStatus,
    reason: ParticipationStatusReason,
    tx: Prisma.TransactionClient,
  ) {
    return ParticipationRepository.bulkSetParticipationStatus(ctx, ids, { status, reason }, tx);
  }

  static async bulkCancelParticipationsByOpportunity(
    ctx: IContext,
    ids: string[],
    tx: Prisma.TransactionClient,
  ) {
    return ParticipationRepository.bulkSetParticipationStatus(
      ctx,
      ids,
      {
        status: ParticipationStatus.NOT_PARTICIPATING,
        reason: ParticipationStatusReason.OPPORTUNITY_CANCELED,
      },
      tx,
    );
  }
}
