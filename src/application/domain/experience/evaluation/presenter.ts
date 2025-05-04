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
      ...record,
      status: "PENDING",
      evaluator: {
        id: record.evaluatorId || "",
        name: "",
        createdAt: new Date(),
        updatedAt: null,
        bio: null,
        image: null,
        slug: "",
        sysRole: "USER",
        currentPrefecture: "UNKNOWN",
        urlFacebook: null,
        urlInstagram: null,
        urlX: null,
        urlWebsite: null,
        urlTiktok: null,
        urlYoutube: null
      },
      participation: {
        id: record.participationId || "",
        status: "PENDING",
        reason: "PERSONAL_RECORD",
        source: "INTERNAL",
        createdAt: new Date(),
        updatedAt: null,
        description: null,
        user: null,
        reservation: null,
        community: null,
        images: [],
        evaluation: null,
        statusHistories: null,
        ticketStatusHistories: null,
        transactions: null
      }
    };
  }

  static create(record: PrismaEvaluation | PrismaEvaluationDetail): GqlEvaluationCreateSuccess {
    return {
      __typename: "EvaluationCreateSuccess",
      evaluation: this.get(record),
    };
  }
}
