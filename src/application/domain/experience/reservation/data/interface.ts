import { GqlQueryReservationsArgs, GqlReservationsConnection } from "@/types/graphql";
import { IContext } from "@/types/server";
import {
  PrismaReservation,
  PrismaReservationDetail,
} from "@/application/domain/experience/reservation/data/type";
import { ReservationStatuses } from "@/application/domain/experience/reservation/helper";
import { Prisma, ReservationStatus } from "@prisma/client";

export interface IReservationService {
  fetchReservations(
    ctx: IContext,
    args: GqlQueryReservationsArgs,
  ): Promise<GqlReservationsConnection>;

  fetchConflictingReservations(
    ctx: IContext,
    userId: string,
    slotId: string,
  ): Promise<PrismaReservationDetail[]>;

  findReservation(ctx: IContext, id: string): Promise<PrismaReservationDetail | null>;

  findReservationOrThrow(ctx: IContext, id: string): Promise<PrismaReservationDetail>;

  createReservation(
    ctx: IContext,
    opportunitySlotId: string,
    participantCount: number,
    userIdsIfExists: string[],
    reservationStatuses: ReservationStatuses,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaReservationDetail>;

  setStatus(
    ctx: IContext,
    id: string,
    currentUserId: string,
    status: ReservationStatus,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaReservationDetail>;
}

export interface IReservationRepository {
  query(
    ctx: IContext,
    where: Prisma.ReservationWhereInput,
    orderBy: Prisma.ReservationOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaReservationDetail[]>;

  count(
    ctx: IContext,
    where: Prisma.ReservationWhereInput,
    tx: Prisma.TransactionClient,
  ): Promise<number>;

  find(ctx: IContext, id: string): Promise<PrismaReservationDetail | null>;

  checkConflict(ctx: IContext, where: Prisma.ReservationWhereInput): Promise<PrismaReservation[]>;

  create(
    ctx: IContext,
    data: Prisma.ReservationCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaReservationDetail>;

  setStatus(
    ctx: IContext,
    id: string,
    data: Prisma.ReservationUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReservationDetail>;
}
