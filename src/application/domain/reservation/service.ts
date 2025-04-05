import { GqlQueryReservationsArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import ReservationRepository from "@/application/domain/reservation/data/repository";
import ReservationConverter from "@/application/domain/reservation/data/converter";
import { Prisma, ReservationStatus } from "@prisma/client";
import { getCurrentUserId } from "@/application/domain/utils";
import { NotFoundError } from "@/errors/graphql";
import { ReservationStatuses } from "@/application/domain/reservation/type";
import { PrismaReservation } from "@/application/domain/reservation/data/type";

export default class ReservationService {
  static async fetchReservations(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryReservationsArgs,
    take: number,
  ) {
    const where = ReservationConverter.filter(filter);
    const orderBy = ReservationConverter.sort(sort);

    return await ReservationRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async fetchConflictingReservations(
    ctx: IContext,
    userId: string,
    slotId: string,
  ): Promise<PrismaReservation[]> {
    const where = ReservationConverter.checkConflict(userId, slotId);
    return ReservationRepository.checkConflict(ctx, where);
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

  static async createReservation(
    ctx: IContext,
    opportunitySlotId: string,
    participantCount: number,
    userIdsIfExists: string[] = [],
    reservationStatuses: ReservationStatuses,
    tx: Prisma.TransactionClient,
  ) {
    const currentUserId = getCurrentUserId(ctx);
    const data = ReservationConverter.create(
      opportunitySlotId,
      currentUserId,
      participantCount,
      userIdsIfExists,
      reservationStatuses,
    );
    return ReservationRepository.create(ctx, data, tx);
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
