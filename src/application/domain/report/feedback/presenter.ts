import {
  GqlReportFeedback,
  GqlReportFeedbacksConnection,
  GqlReportTemplateStats,
  GqlReportVariant,
} from "@/types/graphql";
import {
  PrismaReportFeedback,
  ReportTemplateStatsRow,
} from "@/application/domain/report/feedback/data/type";

export default class ReportFeedbackPresenter {
  // `user` is resolved by a field resolver via the existing user
  // DataLoader, so the Prisma select shape omits it. The cast bridges
  // the type gap until ReportFeedback is added to codegen.yaml mappers.
  static feedback(f: PrismaReportFeedback): GqlReportFeedback {
    return f as unknown as GqlReportFeedback;
  }

  static connection(
    items: PrismaReportFeedback[],
    totalCount: number,
    requestedFirst: number,
  ): GqlReportFeedbacksConnection {
    const hasNextPage = items.length > requestedFirst;
    const page = hasNextPage ? items.slice(0, requestedFirst) : items;
    return {
      edges: page.map((f) => ({
        cursor: f.id,
        node: ReportFeedbackPresenter.feedback(f),
      })),
      pageInfo: {
        hasNextPage,
        hasPreviousPage: false,
        startCursor: page[0]?.id ?? null,
        endCursor: page[page.length - 1]?.id ?? null,
      },
      totalCount,
    };
  }

  static templateStats(
    row: ReportTemplateStatsRow & { correlationWarning: boolean },
  ): GqlReportTemplateStats {
    return {
      // Upstream only accepts `ReportVariant!` as the query argument, so
      // the row's `variant` is always one of the enum members — the cast
      // just narrows the service's `string` return to the codegen enum
      // without an extra runtime check.
      variant: row.variant as GqlReportVariant,
      version: row.version,
      avgRating: row.avgRating,
      feedbackCount: row.feedbackCount,
      avgJudgeScore: row.avgJudgeScore,
      judgeHumanCorrelation: row.judgeHumanCorrelation,
      correlationWarning: row.correlationWarning,
    };
  }
}
