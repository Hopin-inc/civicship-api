import { ReservationStatus, Prisma } from "@prisma/client";
import { ReservationStatuses } from "@/application/domain/experience/reservation/helper";
import { getCurrentUserId, clampFirst } from "@/application/domain/utils";
import { NotFoundError } from "@/errors/graphql";
import { inject, injectable } from "tsyringe";
import {
  IReservationRepository,
  IReservationService,
} from "@/application/domain/experience/reservation/data/interface";
import { IContext } from "@/types/server";
import ReservationConverter from "@/application/domain/experience/reservation/data/converter";
import ReservationPresenter from "@/application/domain/experience/reservation/presenter";
import { GqlQueryReservationsArgs } from "@/types/graphql";

@injectable()
export default class ReservationService implements IReservationService {
  constructor(
    @inject("ReservationRepository") private readonly repository: IReservationRepository,
    @inject("ReservationConverter") private readonly converter: ReservationConverter,
  ) {}

  async fetchReservations(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryReservationsArgs,
  ) {
    const take = clampFirst(first);
    const where = this.converter.filter(filter);
    const orderBy = this.converter.sort(sort);
    const results = await this.repository.query(ctx, where, orderBy, take, cursor);
    const hasNextPage = results.length > take;
    const sliced = results.slice(0, take).map(ReservationPresenter.get);
    return ReservationPresenter.query(sliced, hasNextPage);
  }

  async fetchConflictingReservations(ctx: IContext, userId: string, slotId: string) {
    const where = this.converter.checkConflict(userId, slotId);
    return this.repository.checkConflict(ctx, where);
  }

  async findReservation(ctx: IContext, id: string) {
    return this.repository.find(ctx, id);
  }

  async findReservationOrThrow(ctx: IContext, id: string) {
    const reservation = await this.repository.find(ctx, id);

    if (!reservation) {
      throw new NotFoundError("Reservation not found", { id });
    }

    return reservation;
  }

  async createReservation(
    ctx: IContext,
    opportunitySlotId: string,
    participantCount: number,
    userIdsIfExists: string[],
    reservationStatuses: ReservationStatuses,
    tx: Prisma.TransactionClient,
    comment?: string,
    communityId?: string,
  ) {
    const currentUserId = getCurrentUserId(ctx);
    const data = this.converter.create(
      opportunitySlotId,
      currentUserId,
      participantCount,
      userIdsIfExists,
      reservationStatuses,
      comment,
      communityId,
    );
    return this.repository.create(ctx, data, tx);
  }

  async setStatus(
    ctx: IContext,
    id: string,
    currentUserId: string,
    status: ReservationStatus,
    tx: Prisma.TransactionClient,
  ) {
    const data = this.converter.setStatus(currentUserId, status);

    return this.repository.setStatus(ctx, id, data, tx);
  }
}
