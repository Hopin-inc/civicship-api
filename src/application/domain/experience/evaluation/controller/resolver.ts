import {
  GqlQueryEvaluationsArgs,
  GqlQueryEvaluationArgs,
  GqlMutationEvaluationPassArgs,
  GqlMutationEvaluationFailArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { container } from "tsyringe";
import EvaluationUseCase from "@/application/domain/experience/evaluation/usecase";

const evaluationResolver = {
  Query: {
    evaluations: async (_: unknown, args: GqlQueryEvaluationsArgs, ctx: IContext) => {
      const evaluationUseCase = container.resolve(EvaluationUseCase);
      return evaluationUseCase.visitorBrowseEvaluations(ctx, args);
    },
    evaluation: async (_: unknown, args: GqlQueryEvaluationArgs, ctx: IContext) => {
      const evaluationUseCase = container.resolve(EvaluationUseCase);
      if (!ctx.loaders?.evaluation) {
        return evaluationUseCase.visitorViewEvaluation(ctx, args);
      }
      return ctx.loaders.evaluation.load(args.id);
    },
  },

  Mutation: {
    evaluationPass: async (_: unknown, args: GqlMutationEvaluationPassArgs, ctx: IContext) => {
      const evaluationUseCase = container.resolve(EvaluationUseCase);
      return evaluationUseCase.managerPassEvaluation(args, ctx);
    },
    evaluationFail: async (_: unknown, args: GqlMutationEvaluationFailArgs, ctx: IContext) => {
      const evaluationUseCase = container.resolve(EvaluationUseCase);
      return evaluationUseCase.managerFailEvaluation(args, ctx);
    },
  },
};

export default evaluationResolver;
