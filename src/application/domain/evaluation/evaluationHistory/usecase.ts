import {
  GqlQueryEvaluationHistoriesArgs,
  GqlQueryEvaluationHistoryArgs,
  GqlEvaluationHistory,
  GqlEvaluationHistoriesConnection,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import EvaluationHistoryService from "@/application/domain/evaluation/evaluationHistory/service";
import EvaluationHistoryPresenter from "@/application/domain/evaluation/evaluationHistory/presenter";

export default class EvaluationHistoryUseCase {
  static async visitorBrowseEvaluationHistories(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryEvaluationHistoriesArgs,
  ): Promise<GqlEvaluationHistoriesConnection> {
    return EvaluationHistoryService.fetchEvaluationHistories(ctx, {
      cursor,
      filter,
      sort,
      first,
    });
  }

  static async visitorViewEvaluationHistory(
    ctx: IContext,
    { id }: GqlQueryEvaluationHistoryArgs,
  ): Promise<GqlEvaluationHistory | null> {
    const record = await EvaluationHistoryService.findEvaluationHistory(ctx, id);
    return record ? EvaluationHistoryPresenter.get(record) : null;
  }
}
