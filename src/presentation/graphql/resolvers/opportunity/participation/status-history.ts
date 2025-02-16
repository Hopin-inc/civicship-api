import {
  GqlQueryParticipationStatusHistoriesArgs,
  GqlQueryParticipationStatusHistoryArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationStatusHistoryReadUseCase from "@/app/opportunity/participation/statusHistory/usecase/read";

const participationStatusHistoryResolver = {
  Query: {
    participationStatusHistories: async (
      _: unknown,
      args: GqlQueryParticipationStatusHistoriesArgs,
      ctx: IContext,
    ) => {
      return ParticipationStatusHistoryReadUseCase.visitorBrowseParticipationStatusHistories(
        args,
        ctx,
      );
    },
    participationStatusHistory: async (
      _: unknown,
      args: GqlQueryParticipationStatusHistoryArgs,
      ctx: IContext,
    ) => {
      if (!ctx.loaders?.participationStatusHistory) {
        return ParticipationStatusHistoryReadUseCase.visitorViewParticipationStatusHistory(
          args,
          ctx,
        );
      }
      return ctx.loaders.participationStatusHistory.load(args.id);
    },
  },
};

export default participationStatusHistoryResolver;
