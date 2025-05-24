import {
  GqlQueryEvaluationsArgs,
  GqlQueryEvaluationArgs,
  GqlMutationEvaluationPassArgs,
  GqlMutationEvaluationFailArgs,
  GqlMutationEvaluationBulkCreateArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import EvaluationUseCase from "@/application/domain/experience/evaluation/usecase";
import { PrismaEvaluationDetail } from "@/application/domain/experience/evaluation/data/type";

@injectable()
export default class EvaluationResolver {
  constructor(@inject("EvaluationUseCase") private readonly evaluationUseCase: EvaluationUseCase) {}

  Query = {
    evaluations: (_: unknown, args: GqlQueryEvaluationsArgs, ctx: IContext) => {
      return this.evaluationUseCase.visitorBrowseEvaluations(ctx, args);
    },

    evaluation: (_: unknown, args: GqlQueryEvaluationArgs, ctx: IContext) => {
      return ctx.loaders.evaluation.load(args.id);
    },
  };

  Mutation = {
    evaluationPass: (_: unknown, args: GqlMutationEvaluationPassArgs, ctx: IContext) => {
      return this.evaluationUseCase.managerPassEvaluation(args, ctx);
    },
    evaluationFail: (_: unknown, args: GqlMutationEvaluationFailArgs, ctx: IContext) => {
      return this.evaluationUseCase.managerFailEvaluation(args, ctx);
    },
    evaluationBulkCreate: (_: unknown, args: GqlMutationEvaluationBulkCreateArgs, ctx: IContext) => {
      return this.evaluationUseCase.managerBulkCreateEvaluations(args, ctx);
    },
  };

  Evaluation = {
    evaluator: (parent: PrismaEvaluationDetail, _: unknown, ctx: IContext) => {
      return parent.evaluatorId ? ctx.loaders.user.load(parent.evaluatorId) : null;
    },

    participation: (parent: PrismaEvaluationDetail, _: unknown, ctx: IContext) => {
      return parent.participationId ? ctx.loaders.participation.load(parent.participationId) : null;
    },

    histories: (parent: PrismaEvaluationDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.evaluationHistoriesByEvaluation.load(parent.id);
    },
  };
}
