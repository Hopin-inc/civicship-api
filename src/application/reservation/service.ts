import { GqlReservationsConnection, GqlQueryReservationsArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import ReservationRepository from "@/application/reservation/data/repository";
import ReservationConverter from "@/application/reservation/data/converter";
import ReservationPresenter from "@/application/reservation/presenter";
import { OpportunityCategory, Prisma, ReservationStatus } from "@prisma/client";
import { getCurrentUserId, clampFirst } from "@/application/utils";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import { reservationStatuses } from "@/application/reservation/helper";

export default class ReservationService {
  static async fetchReservations(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryReservationsArgs,
  ): Promise<GqlReservationsConnection> {
    const take = clampFirst(first);
    const where = ReservationConverter.filter(filter);
    const orderBy = ReservationConverter.sort(sort);
    const results = await ReservationRepository.query(ctx, where, orderBy, take, cursor);
    const hasNextPage = results.length > take;
    const sliced = results.slice(0, take).map(ReservationPresenter.get);
    return ReservationPresenter.query(sliced, hasNextPage);
  }

  static async countUserReservationsByCategory(
    ctx: IContext,
    userId: string,
    category: OpportunityCategory,
    tx: Prisma.TransactionClient,
  ): Promise<number> {
    const where = ReservationConverter.countByUserAndOpportunityCategory(userId, category);
    return ReservationRepository.count(ctx, where, tx);
  }

  static async findReservation(ctx: IContext, id: string) {
    return ReservationRepository.find(ctx, id);
  }

  static async findReservationOrThrow(ctx: IContext, id: string) {
    const reservation = await ReservationRepository.find(ctx, id);

    if (!reservation) {
      throw new NotFoundError("Reservation not found", { id });
    }

    return reservation;
  }

  static async checkConflictBeforeReservation(
    ctx: IContext,
    currentUserId: string,
    slotStartsAt: Date,
    slotEndsAt: Date,
  ) {
    const where = ReservationConverter.checkConflict(currentUserId, slotStartsAt, slotEndsAt);
    const conflicts = await ReservationRepository.checkConflict(ctx, where);

    if (conflicts.length > 0) {
      throw new ValidationError("You already have a conflicting reservation.");
    }
  }

  static async createReservation(
    ctx: IContext,
    opportunitySlotId: string,
    participantCount: number,
    userIdsIfExists: string[] = [],
    reservationStatuses: reservationStatuses,
  ) {
    const currentUserId = getCurrentUserId(ctx);
    const data = ReservationConverter.create(
      opportunitySlotId,
      currentUserId,
      participantCount,
      userIdsIfExists,
      reservationStatuses,
    );
    return ReservationRepository.create(ctx, data);
  }

  static async setStatus(
    ctx: IContext,
    id: string,
    currentUserId: string,
    status: ReservationStatus,
    tx: Prisma.TransactionClient,
  ) {
    const data = ReservationConverter.setStatus(currentUserId, status);

    return ReservationRepository.setStatus(ctx, id, data, tx);
  }
}
