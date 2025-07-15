import { GqlEvaluation, GqlEvaluationsConnection } from "@/types/graphql";
import { PrismaEvaluationDetail } from "@/application/domain/experience/evaluation/data/type";

export default class EvaluationPresenter {
  static query(records: GqlEvaluation[], hasNextPage: boolean, cursor?: string): GqlEvaluationsConnection {
    return {
      __typename: "EvaluationsConnection",
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

  static get(record: PrismaEvaluationDetail): GqlEvaluation {
    return {
      __typename: "Evaluation",
      ...record,
    };
  }

  static bulkCreate(records: PrismaEvaluationDetail[]): {
    __typename: "EvaluationBulkCreateSuccess";
    evaluations: GqlEvaluation[];
  } {
    return {
      __typename: "EvaluationBulkCreateSuccess",
      evaluations: records.map((record) => this.get(record)),
    };
  }
}
