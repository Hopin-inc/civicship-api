import {
  GqlEvaluationHistoryFilterInput,
  GqlEvaluationHistorySortInput,
  GqlEvaluationHistoriesConnection,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import EvaluationHistoryRepository from "@/application/domain/experience/evaluation/evaluationHistory/data/repository";
import EvaluationHistoryPresenter from "@/application/domain/experience/evaluation/evaluationHistory/presenter";
import EvaluationHistoryConverter from "@/application/domain/experience/evaluation/evaluationHistory/data/converter";
import { clampFirst } from "@/application/domain/utils";
import { NotFoundError } from "@/errors/graphql";

export default class EvaluationHistoryService {
  static async fetchEvaluationHistories(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlEvaluationHistoryFilterInput;
      sort?: GqlEvaluationHistorySortInput;
      first?: number;
    },
  ): Promise<GqlEvaluationHistoriesConnection> {
    const take = clampFirst(first);
    const where = EvaluationHistoryConverter.filter(filter);
    const orderBy = EvaluationHistoryConverter.sort(sort);

    const res = await EvaluationHistoryRepository.query(ctx, where, orderBy, take, cursor);
    const hasNextPage = res.length > take;
    const data = res.slice(0, take).map(EvaluationHistoryPresenter.get);
    return EvaluationHistoryPresenter.query(data, hasNextPage, cursor);
  }

  static async findEvaluationHistory(ctx: IContext, id: string) {
    return EvaluationHistoryRepository.find(ctx, id);
  }

  static async findEvaluationHistoryOrThrow(ctx: IContext, id: string) {
    const record = await this.findEvaluationHistory(ctx, id);
    if (!record) throw new NotFoundError("EvaluationHistory not found", { id });
    return record;
  }
}
