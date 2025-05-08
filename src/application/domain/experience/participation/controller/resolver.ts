import {
  GqlMutationParticipationCreatePersonalRecordArgs,
  GqlMutationParticipationDeletePersonalRecordArgs,
  GqlParticipationCreatePersonalRecordPayload,
  GqlParticipationDeletePayload,
  GqlQueryParticipationArgs,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import ParticipationUseCase from "@/application/domain/experience/participation/usecase";
import { PrismaParticipationDetail } from "@/application/domain/experience/participation/data/type";

@injectable()
export default class ParticipationResolver {
  constructor(
    @inject("ParticipationUseCase") private readonly participationUseCase: ParticipationUseCase,
  ) { }

  Query = {
    participations: (_: unknown, args: GqlQueryParticipationsArgs, ctx: IContext) => {
      return this.participationUseCase.visitorBrowseParticipations(args, ctx);
    },

    participation: (_: unknown, args: GqlQueryParticipationArgs, ctx: IContext) => {
      if (ctx.loaders?.participation) {
        return ctx.loaders.participation.load(args.id);
      }
      return this.participationUseCase.visitorViewParticipation(args, ctx);
    },
  };

  Mutation = {
    participationCreatePersonalRecord: (
      _: unknown,
      args: GqlMutationParticipationCreatePersonalRecordArgs,
      ctx: IContext,
    ): Promise<GqlParticipationCreatePersonalRecordPayload> => {
      return this.participationUseCase.userCreatePersonalParticipationRecord(args, ctx);
    },

    participationDeletePersonalRecord: (
      _: unknown,
      args: GqlMutationParticipationDeletePersonalRecordArgs,
      ctx: IContext,
    ): Promise<GqlParticipationDeletePayload> => {
      return this.participationUseCase.userDeletePersonalParticipationRecord(args, ctx);
    },
  };

  Participation = {
    images: (parent: PrismaParticipationDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.image.loadMany(parent.images.map(i => i.id));
    },

    user: (parent: PrismaParticipationDetail, _: unknown, ctx: IContext) => {
      return parent.userId ? ctx.loaders.user.load(parent.userId) : null;
    },

    community: (parent: PrismaParticipationDetail, _: unknown, ctx: IContext) => {
      return parent.communityId ? ctx.loaders.community.load(parent.communityId) : null;
    },

    reservation: (parent: PrismaParticipationDetail, _: unknown, ctx: IContext) => {
      return parent.reservationId ? ctx.loaders.reservation.load(parent.reservationId) : null;
    },

    statusHistories: (parent: PrismaParticipationDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.participationStatusHistory.loadMany(parent.statusHistories.map((p) => p.id))
    },
  };
}
