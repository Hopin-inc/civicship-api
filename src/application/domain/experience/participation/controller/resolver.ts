import {
  GqlMutationParticipationCreatePersonalRecordArgs,
  GqlMutationParticipationDeletePersonalRecordArgs,
  GqlParticipation,
  GqlParticipationCreatePersonalRecordPayload,
  GqlParticipationDeletePayload,
  GqlParticipationStatusHistoriesArgs,
  GqlQueryParticipationArgs,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import ParticipationUseCase from "@/application/domain/experience/participation/usecase";
import ParticipationStatusHistoryUseCase from "@/application/domain/experience/participation/statusHistory/usecase";
import { PrismaParticipationDetail } from "@/application/domain/experience/participation/data/type";

@injectable()
export default class ParticipationResolver {
  constructor(
    @inject("ParticipationUseCase") private readonly participationUseCase: ParticipationUseCase,
    @inject("ParticipationStatusHistoryUseCase")
    private readonly statusHistoryUseCase: ParticipationStatusHistoryUseCase,
  ) {}

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
    user: (parent: PrismaParticipationDetail, _: unknown, ctx: IContext) => {
      return parent.userId && ctx.loaders?.user ? ctx.loaders.user.load(parent.userId) : null;
    },
    
    community: (parent: PrismaParticipationDetail, _: unknown, ctx: IContext) => {
      return parent.communityId && ctx.loaders?.community ? ctx.loaders.community.load(parent.communityId) : null;
    },
    
    reservation: (parent: PrismaParticipationDetail, _: unknown, ctx: IContext) => {
      return parent.reservationId && ctx.loaders?.reservation ? ctx.loaders.reservation.load(parent.reservationId) : null;
    },
    
    statusHistories: (
      parent: PrismaParticipationDetail,
      args: GqlParticipationStatusHistoriesArgs,
      ctx: IContext,
    ) => {
      return this.statusHistoryUseCase.visitorBrowseStatusHistoriesByParticipation(
        parent as unknown as GqlParticipation,
        args,
        ctx,
      );
    },
  };
}
