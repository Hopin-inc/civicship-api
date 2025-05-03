import "reflect-metadata";
import {
  GqlQueryReservationsArgs,
  GqlQueryReservationArgs,
  GqlMutationReservationCreateArgs,
  GqlMutationReservationAcceptArgs,
  GqlMutationReservationRejectArgs,
  GqlMutationReservationJoinArgs,
  GqlMutationReservationCancelArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import ReservationUseCase from "@/application/domain/experience/reservation/usecase";
import { PrismaReservationDetail } from "@/application/domain/experience/reservation/data/type";

@injectable()
export default class ReservationResolver {
  constructor(
    @inject("ReservationUseCase") private readonly reservationUseCase: ReservationUseCase,
  ) {}

  Query = {
    reservations: (_: unknown, args: GqlQueryReservationsArgs, ctx: IContext) => {
      return this.reservationUseCase.visitorBrowseReservations(ctx, args);
    },
    reservation: (_: unknown, args: GqlQueryReservationArgs, ctx: IContext) => {
      return ctx.loaders.reservation.load(args.id);
    },
  };
  
  Reservation = {
    opportunitySlot: (parent: PrismaReservationDetail, _: unknown, ctx: IContext) => {
      return parent.opportunitySlotId ? ctx.loaders.opportunitySlot.load(parent.opportunitySlotId) : null;
    },
    
    createdByUser: (parent: PrismaReservationDetail, _: unknown, ctx: IContext) => {
      return parent.createdByUserId ? ctx.loaders.user.load(parent.createdByUserId) : null;
    },
    
    participations: (parent: PrismaReservationDetail, _: unknown, ctx: IContext) => {
      return parent.participations ? ctx.loaders.participation.loadMany(parent.participations.map(p => p.id)) : [];
    },
  };

  Mutation = {
    reservationCreate: (_: unknown, args: GqlMutationReservationCreateArgs, ctx: IContext) => {
      return this.reservationUseCase.userReserveParticipation(args, ctx);
    },
    reservationAccept: (_: unknown, args: GqlMutationReservationAcceptArgs, ctx: IContext) => {
      return this.reservationUseCase.managerAcceptReservation(args, ctx);
    },
    reservationReject: (_: unknown, args: GqlMutationReservationRejectArgs, ctx: IContext) => {
      return this.reservationUseCase.managerRejectReservation(args, ctx);
    },
    reservationCancel: (_: unknown, args: GqlMutationReservationCancelArgs, ctx: IContext) => {
      return this.reservationUseCase.userCancelMyReservation(args, ctx);
    },
    reservationJoin: (_: unknown, args: GqlMutationReservationJoinArgs, ctx: IContext) => {
      return this.reservationUseCase.userJoinReservation(args, ctx);
    },
  };
}
