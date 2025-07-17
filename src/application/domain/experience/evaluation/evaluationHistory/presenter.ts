import { GqlEvaluationHistory, GqlEvaluationHistoriesConnection } from "@/types/graphql";
import { PrismaEvaluationHistory } from "@/application/domain/experience/evaluation/evaluationHistory/data/type";

export default class EvaluationHistoryPresenter {
  static query(
    records: GqlEvaluationHistory[],
    hasNextPage: boolean,
    cursor?: string,
  ): GqlEvaluationHistoriesConnection {
    return {
      totalCount: records.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        startCursor: records[0]?.id,
        endCursor: records.length ? records[records.length - 1].id : undefined,
      },
      edges: records.map((record) => ({
        cursor: record.id,
        node: record,
      })),
    };
  }

  static get(record: PrismaEvaluationHistory): GqlEvaluationHistory {
    const { createdByUser, evaluation, ...prop } = record;

    return {
      ...prop,
      createdByUser,
      evaluation,
    };
  }
}
