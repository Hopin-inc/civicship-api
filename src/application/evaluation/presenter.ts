import {
  GqlEvaluation,
  GqlEvaluationCreateSuccess,
  GqlEvaluationsConnection,
} from "@/types/graphql";
import { PrismaEvaluation } from "@/application/evaluation/data/type";
import ParticipationPresenter from "@/application/participation/presenter";
import UserPresenter from "@/application/user/presenter";

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

  static get(record: PrismaEvaluation): GqlEvaluation {
    const { evaluator, participation, ...rest } = record;

    return {
      ...rest,
      evaluator: UserPresenter.get(evaluator),
      participation: ParticipationPresenter.get(participation),
    };
  }

  static create(record: PrismaEvaluation): GqlEvaluationCreateSuccess {
    return {
      __typename: "EvaluationCreateSuccess",
      evaluation: this.get(record),
    };
  }
}
