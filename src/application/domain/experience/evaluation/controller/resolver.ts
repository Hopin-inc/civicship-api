import {
  GqlQueryEvaluationsArgs,
  GqlQueryEvaluationArgs,
  GqlMutationEvaluationPassArgs,
  GqlMutationEvaluationFailArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import EvaluationUseCase from "@/application/domain/experience/evaluation/usecase";

@injectable()
export default class EvaluationResolver {
  constructor(@inject("EvaluationUseCase") private readonly evaluationUseCase: EvaluationUseCase) {}

  Query = {
    evaluations: (_: unknown, args: GqlQueryEvaluationsArgs, ctx: IContext) => {
      return this.evaluationUseCase.visitorBrowseEvaluations(ctx, args);
    },

    evaluation: (_: unknown, args: GqlQueryEvaluationArgs, ctx: IContext) => {
      return this.evaluationUseCase.visitorViewEvaluation(ctx, args);
    },
  };

  Mutation = {
    evaluationPass: (_: unknown, args: GqlMutationEvaluationPassArgs, ctx: IContext) => {
      return this.evaluationUseCase.managerPassEvaluation(args, ctx);
    },
    evaluationFail: (_: unknown, args: GqlMutationEvaluationFailArgs, ctx: IContext) => {
      return this.evaluationUseCase.managerFailEvaluation(args, ctx);
    },
  };
}
