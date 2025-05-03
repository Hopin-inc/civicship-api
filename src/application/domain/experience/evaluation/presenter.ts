import {
  GqlEvaluation,
  GqlEvaluationCreateSuccess,
  GqlEvaluationsConnection,
} from "@/types/graphql";
import { PrismaEvaluation, PrismaEvaluationDetail } from "@/application/domain/experience/evaluation/data/type";

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

  static get(record: PrismaEvaluation | PrismaEvaluationDetail): GqlEvaluation {
    return {
      id: record.id,
      score: record.score,
      comment: record.comment,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      evaluator: null,
      participation: null,
    };
  }

  static create(record: PrismaEvaluation | PrismaEvaluationDetail): GqlEvaluationCreateSuccess {
    return {
      __typename: "EvaluationCreateSuccess",
      evaluation: this.get(record),
    };
  }
}
