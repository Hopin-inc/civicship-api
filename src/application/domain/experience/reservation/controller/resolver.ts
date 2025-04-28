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
import { container } from "tsyringe";

const reservationResolver = {
  Query: {
    reservations: (_: unknown, args: GqlQueryReservationsArgs, ctx: IContext) => {
      const usecase = container.resolve("ReservationUseCase");
      return usecase.visitorBrowseReservations(ctx, args);
    },
    reservation: async (_: unknown, args: GqlQueryReservationArgs, ctx: IContext) => {
      const usecase = container.resolve("ReservationUseCase");
      if (ctx.loaders?.reservation) {
        return ctx.loaders.reservation.load(args.id);
      }
      return usecase.visitorViewReservation(ctx, args);
    },
  },

  Mutation: {
    reservationCreate: (_: unknown, args: GqlMutationReservationCreateArgs, ctx: IContext) => {
      const usecase = container.resolve("ReservationUseCase");
      return usecase.userReserveParticipation(args, ctx);
    },
    reservationAccept: (_: unknown, args: GqlMutationReservationAcceptArgs, ctx: IContext) => {
      const usecase = container.resolve("ReservationUseCase");
      return usecase.managerAcceptReservation(args, ctx);
    },
    reservationReject: (_: unknown, args: GqlMutationReservationRejectArgs, ctx: IContext) => {
      const usecase = container.resolve("ReservationUseCase");
      return usecase.managerRejectReservation(args, ctx);
    },
    reservationCancel: (_: unknown, args: GqlMutationReservationCancelArgs, ctx: IContext) => {
      const usecase = container.resolve("ReservationUseCase");
      return usecase.userCancelMyReservation(args, ctx);
    },
    reservationJoin: (_: unknown, args: GqlMutationReservationJoinArgs, ctx: IContext) => {
      const usecase = container.resolve("ReservationUseCase");
      return usecase.userJoinReservation(args, ctx);
    },
  },
};

export default reservationResolver;
