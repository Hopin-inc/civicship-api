import {
  GqlQueryParticipationStatusHistoriesArgs,
  GqlQueryParticipationStatusHistoryArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationStatusHistoryUseCase from "@/application/participation/statusHistory/usecase";

const participationStatusHistoryResolver = {
  Query: {
    participationStatusHistories: async (
      _: unknown,
      args: GqlQueryParticipationStatusHistoriesArgs,
      ctx: IContext,
    ) => {
      return ParticipationStatusHistoryUseCase.visitorBrowseParticipationStatusHistories(args, ctx);
    },
    participationStatusHistory: async (
      _: unknown,
      args: GqlQueryParticipationStatusHistoryArgs,
      ctx: IContext,
    ) => {
      if (!ctx.loaders?.participationStatusHistory) {
        return ParticipationStatusHistoryUseCase.visitorViewParticipationStatusHistory(args, ctx);
      }
      return ctx.loaders.participationStatusHistory.load(args.id);
    },
  },
};

export default participationStatusHistoryResolver;
