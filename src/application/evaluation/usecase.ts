import {
  GqlEvaluation,
  GqlEvaluationCreatePayload,
  GqlEvaluationsConnection,
  GqlMutationEvaluationFailArgs,
  GqlMutationEvaluationPassArgs,
  GqlQueryEvaluationArgs,
  GqlQueryEvaluationsArgs,
} from "@/types/graphql";
import { EvaluationStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import EvaluationService from "@/application/evaluation/service";
import EvaluationPresenter from "@/application/evaluation/presenter";

export default class EvaluationUseCase {
  static async visitorBrowseEvaluations(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryEvaluationsArgs,
  ): Promise<GqlEvaluationsConnection> {
    return EvaluationService.fetchEvaluations(ctx, { cursor, filter, sort, first });
  }

  static async visitorViewEvaluation(
    ctx: IContext,
    { id }: GqlQueryEvaluationArgs,
  ): Promise<GqlEvaluation | null> {
    const record = await EvaluationService.findEvaluation(ctx, id);
    return record ? EvaluationPresenter.get(record) : null;
  }

  static async managerPassEvaluation(
    { input }: GqlMutationEvaluationPassArgs,
    ctx: IContext,
  ): Promise<GqlEvaluationCreatePayload> {
    const res = await EvaluationService.createEvaluation(
      ctx,
      input.participationId,
      EvaluationStatus.PASSED,
      input.comment,
    );
    return EvaluationPresenter.create(res);
  }

  static async managerFailEvaluation(
    { input }: GqlMutationEvaluationFailArgs,
    ctx: IContext,
  ): Promise<GqlEvaluationCreatePayload> {
    const res = await EvaluationService.createEvaluation(
      ctx,
      input.participationId,
      EvaluationStatus.FAILED,
      input.comment,
    );
    return EvaluationPresenter.create(res);
  }
}
