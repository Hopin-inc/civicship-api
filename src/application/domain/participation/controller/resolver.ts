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
import ParticipationUseCase from "@/application/domain/participation/usecase";
import ParticipationStatusHistoryUseCase from "@/application/domain/participation/statusHistory/usecase";

const participationResolver = {
  Query: {
    participations: async (_: unknown, args: GqlQueryParticipationsArgs, ctx: IContext) =>
      ParticipationUseCase.visitorBrowseParticipations(args, ctx),

    participation: async (_: unknown, args: GqlQueryParticipationArgs, ctx: IContext) => {
      if (!ctx.loaders?.participation) {
        return ParticipationUseCase.visitorViewParticipation(args, ctx);
      }
      return await ctx.loaders.participation.load(args.id);
    },
  },
  Mutation: {
    participationCreatePersonalRecord: async (
      _: unknown,
      args: GqlMutationParticipationCreatePersonalRecordArgs,
      ctx: IContext,
    ): Promise<GqlParticipationCreatePersonalRecordPayload> => {
      return ParticipationUseCase.userCreatePersonalParticipationRecord(args, ctx);
    },

    participationDeletePersonalRecord: async (
      _: unknown,
      args: GqlMutationParticipationDeletePersonalRecordArgs,
      ctx: IContext,
    ): Promise<GqlParticipationDeletePayload> => {
      return ParticipationUseCase.userDeletePersonalParticipationRecord(args, ctx);
    },
  },
  Participation: {
    statusHistories: async (
      parent: GqlParticipation,
      args: GqlParticipationStatusHistoriesArgs,
      ctx: IContext,
    ) => {
      return ParticipationStatusHistoryUseCase.visitorBrowseStatusHistoriesByParticipation(
        parent,
        args,
        ctx,
      );
    },
  },
};

export default participationResolver;
