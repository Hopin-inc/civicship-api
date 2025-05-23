import { GqlQueryEvaluationHistoryArgs, GqlQueryEvaluationHistoriesArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import EvaluationHistoryUseCase from "@/application/domain/experience/evaluation/evaluationHistory/usecase";

const evaluationHistoryResolver = {
  Query: {
    evaluationHistories: (_: unknown, args: GqlQueryEvaluationHistoriesArgs, ctx: IContext) => {
      return EvaluationHistoryUseCase.visitorBrowseEvaluationHistories(ctx, args);
    },

    evaluationHistory: async (_: unknown, args: GqlQueryEvaluationHistoryArgs, ctx: IContext) => {
      return EvaluationHistoryUseCase.visitorViewEvaluationHistory(ctx, args);
    },
  },
};

export default evaluationHistoryResolver;
