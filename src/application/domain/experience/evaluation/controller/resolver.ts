import {
  GqlQueryEvaluationsArgs,
  GqlQueryEvaluationArgs,
  GqlMutationEvaluationPassArgs,
  GqlMutationEvaluationFailArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import EvaluationUseCase from "@/application/domain/experience/evaluation/usecase";

const evaluationResolver = {
  Query: {
    evaluations: (_: unknown, args: GqlQueryEvaluationsArgs, ctx: IContext) => {
      return EvaluationUseCase.visitorBrowseEvaluations(ctx, args);
    },
    evaluation: async (_: unknown, args: GqlQueryEvaluationArgs, ctx: IContext) => {
      if (!ctx.loaders?.evaluation) {
        return EvaluationUseCase.visitorViewEvaluation(ctx, args);
      }
      return ctx.loaders.evaluation.load(args.id);
    },
  },

  Mutation: {
    evaluationPass: (_: unknown, args: GqlMutationEvaluationPassArgs, ctx: IContext) => {
      return EvaluationUseCase.managerPassEvaluation(args, ctx);
    },
    evaluationFail: (_: unknown, args: GqlMutationEvaluationFailArgs, ctx: IContext) => {
      return EvaluationUseCase.managerFailEvaluation(args, ctx);
    },
  },
};

export default evaluationResolver;
