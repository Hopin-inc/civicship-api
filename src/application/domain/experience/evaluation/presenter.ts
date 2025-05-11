import {
  GqlEvaluation,
  GqlEvaluationCreateSuccess,
  GqlEvaluationsConnection,
} from "@/types/graphql";
import { PrismaEvaluationDetail } from "@/application/domain/experience/evaluation/data/type";

export default class EvaluationPresenter {
  static query(records: GqlEvaluation[], hasNextPage: boolean): GqlEvaluationsConnection {
    return {
      totalCount: records.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: records[0]?.id,
        endCursor: records.length ? records[records.length - 1].id : undefined,
      },
      edges: records.map((record) => ({
        cursor: record.id,
        node: record,
      })),
    };
  }

  static get(record: PrismaEvaluationDetail): GqlEvaluation {
    return record;
  }

  static create(record: PrismaEvaluationDetail): GqlEvaluationCreateSuccess {
    return {
      evaluation: this.get(record),
    };
  }
}
