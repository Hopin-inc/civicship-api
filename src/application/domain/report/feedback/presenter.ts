import {
  GqlReportFeedback,
  GqlReportFeedbacksConnection,
  GqlReportTemplateStats,
  GqlReportVariant,
  GqlReportTemplateScope,
  GqlReportTemplateKind,
  GqlReportTemplateStatsBreakdownRow,
  GqlReportTemplateStatsBreakdownConnection,
} from "@/types/graphql";
import {
  PrismaReportFeedback,
  ReportTemplateStatsRow,
  TemplateBreakdownRow,
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

  /**
   * One row of the A/B comparison breakdown. Pure projection from the
   * service's enriched row (Pearson + warning fields already filled
   * in upstream). The Prisma → GraphQL enum casts mirror the
   * `templateStats` pattern — values are guaranteed to be one of the
   * enum members because they came from a Prisma enum column.
   */
  static templateBreakdownRow(
    row: TemplateBreakdownRow & {
      judgeHumanCorrelation: number | null;
      correlationWarning: boolean;
    },
  ): GqlReportTemplateStatsBreakdownRow {
    return {
      templateId: row.templateId,
      version: row.version,
      scope: row.scope as GqlReportTemplateScope,
      kind: row.kind as GqlReportTemplateKind,
      experimentKey: row.experimentKey,
      isActive: row.isActive,
      isEnabled: row.isEnabled,
      trafficWeight: row.trafficWeight,
      feedbackCount: row.feedbackCount,
      avgRating: row.avgRating,
      avgJudgeScore: row.avgJudgeScore,
      judgeHumanCorrelation: row.judgeHumanCorrelation,
      correlationWarning: row.correlationWarning,
    };
  }

  /**
   * Connection wrapper for `reportTemplateStatsBreakdown`. Same
   * cursor convention as the existing `connection` (id-based, take=
   * first+1 for `hasNextPage` derivation). `cursor` is the
   * `templateId` so the admin UI can paginate stably across A/B
   * candidate rows even when the underlying ordering would otherwise
   * shift (e.g. an experimentKey deactivation between pages).
   */
  static templateBreakdownConnection(
    items: Array<TemplateBreakdownRow & {
      judgeHumanCorrelation: number | null;
      correlationWarning: boolean;
    }>,
    totalCount: number,
    requestedFirst: number,
  ): GqlReportTemplateStatsBreakdownConnection {
    const hasNextPage = items.length > requestedFirst;
    const page = hasNextPage ? items.slice(0, requestedFirst) : items;
    return {
      edges: page.map((row) => ({
        cursor: row.templateId,
        node: ReportFeedbackPresenter.templateBreakdownRow(row),
      })),
      pageInfo: {
        hasNextPage,
        hasPreviousPage: false,
        startCursor: page[0]?.templateId ?? null,
        endCursor: page[page.length - 1]?.templateId ?? null,
      },
      totalCount,
    };
  }
}
