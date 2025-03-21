import {
  GqlQueryReservationsArgs,
  GqlQueryReservationArgs,
  GqlMutationReservationCreateArgs,
  GqlMutationReservationAcceptArgs,
  GqlMutationReservationRejectArgs,
  GqlMutationReservationCancelArgs,
  GqlMutationReservationJoinArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ReservationUseCase from "@/application/reservation/usecase";

const reservationResolver = {
  Query: {
    reservations: (_: unknown, args: GqlQueryReservationsArgs, ctx: IContext) => {
      return ReservationUseCase.visitorBrowseReservations(ctx, args);
    },
    reservation: async (_: unknown, args: GqlQueryReservationArgs, ctx: IContext) => {
      if (ctx.loaders?.reservation) {
        return ctx.loaders.reservation.load(args.id);
      }
      return ReservationUseCase.visitorViewReservation(ctx, args);
    },
  },

  Mutation: {
    reservationCreate: (_: unknown, args: GqlMutationReservationCreateArgs, ctx: IContext) => {
      return ReservationUseCase.userReserveParticipation(args, ctx);
    },
    reservationAccept: (_: unknown, args: GqlMutationReservationAcceptArgs, ctx: IContext) => {
      return ReservationUseCase.managerAcceptReservation(args, ctx);
    },
    reservationReject: (_: unknown, args: GqlMutationReservationRejectArgs, ctx: IContext) => {
      return ReservationUseCase.managerRejectReservation(args, ctx);
    },
    reservationCancel: (_: unknown, args: GqlMutationReservationCancelArgs, ctx: IContext) => {
      return ReservationUseCase.userCancelMyReservation(args, ctx);
    },
    reservationJoin: (_: unknown, args: GqlMutationReservationJoinArgs, ctx: IContext) => {
      return ReservationUseCase.userJoinReservation(args, ctx);
    },
  },
};

export default reservationResolver;
