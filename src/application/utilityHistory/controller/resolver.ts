import { GqlQueryUtilityHistoriesArgs, GqlQueryUtilityHistoryArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import UtilityHistoryUseCase from "@/application/utilityHistory/usecase";

const utilityHistoryResolver = {
  Query: {
    utilityHistories: async (_: unknown, args: GqlQueryUtilityHistoriesArgs, ctx: IContext) => {
      return UtilityHistoryUseCase.visitorBrowseUtilityHistories(args, ctx);
    },
    utilityHistory: async (_: unknown, args: GqlQueryUtilityHistoryArgs, ctx: IContext) => {
      if (!ctx.loaders?.utilityHistory) {
        return UtilityHistoryUseCase.visitorViewUtilityHistory(args, ctx);
      }
      return ctx.loaders.utilityHistory.load(args.id);
    },
  },
};

export default utilityHistoryResolver;
