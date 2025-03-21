import {
  GqlParticipation,
  GqlParticipationStatusHistoriesArgs,
  GqlQueryParticipationArgs,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationUseCase from "@/application/participation/usecase";
import ParticipationStatusHistoryUseCase from "@/application/participation/statusHistory/usecase";

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
  Mutation: {},

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
