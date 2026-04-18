import { PrismaClient } from "@prisma/client";
import {
  createLoaderById,
  createLoaderByCompositeKey,
  createHasManyLoaderByKey,
} from "@/presentation/graphql/dataloader/utils";
import {
  reportSelect,
  reportTemplateSelect,
  PrismaReport,
  PrismaReportTemplate,
} from "@/application/domain/report/data/type";
import {
  reportFeedbackSelect,
  PrismaReportFeedback,
} from "@/application/domain/report/feedback/data/type";
import ReportPresenter from "@/application/domain/report/presenter";
import ReportFeedbackPresenter from "@/application/domain/report/feedback/presenter";
import { GqlReport, GqlReportFeedback, GqlReportTemplate } from "@/types/graphql";

export function createReportLoader(prisma: PrismaClient) {
  return createLoaderById<PrismaReport, GqlReport>(
    async (ids) =>
      prisma.report.findMany({
        where: { id: { in: [...ids] } },
        select: reportSelect,
      }),
    ReportPresenter.report,
  );
}

export function createReportTemplateLoader(prisma: PrismaClient) {
  return createLoaderById<PrismaReportTemplate, GqlReportTemplate>(
    async (ids) =>
      prisma.reportTemplate.findMany({
        where: { id: { in: [...ids] } },
        select: reportTemplateSelect,
      }),
    ReportPresenter.reportTemplate,
  );
}

export function createReportsByParentRunIdLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"parentRunId", PrismaReport, GqlReport>(
    "parentRunId",
    async (parentRunIds) =>
      prisma.report.findMany({
        where: { parentRunId: { in: [...parentRunIds] } },
        select: reportSelect,
        orderBy: { createdAt: "desc" },
      }),
    ReportPresenter.report,
  );
}

/**
 * Resolves `Report.myFeedback` for the *caller* — the per-Report
 * "did this user already rate this?" lookup. Keyed by
 * `{ reportId, userId }` rather than just `reportId` so the same
 * loader instance correctly handles resolver chains that mix users
 * (e.g. an admin field that materialises another user's session). In
 * the common case every key in a given request shares the same
 * userId, and the batch fan-out is one query per distinct userId.
 *
 * The loader closure carries no auth state itself: the resolver
 * passes `ctx.currentUser.id` at load time. That keeps the loader
 * factory pure (it runs before auth in the request lifecycle) and
 * matches the rest of the dataloader catalogue, which is also
 * constructed from `prisma` alone.
 */
export function createMyReportFeedbackLoader(prisma: PrismaClient) {
  type Key = { reportId: string; userId: string };
  return createLoaderByCompositeKey<Key, PrismaReportFeedback, GqlReportFeedback>(
    async (keys) => {
      // Group by userId — we expect homogeneous userIds within a request,
      // but a single round-trip per *distinct* user keeps the worst case
      // bounded at "number of users involved in this batch" rather than
      // a Cartesian-product `IN (userIds) AND IN (reportIds)` query
      // that would over-fetch.
      const byUser = new Map<string, string[]>();
      for (const k of keys) {
        const list = byUser.get(k.userId);
        if (list) list.push(k.reportId);
        else byUser.set(k.userId, [k.reportId]);
      }

      const all: PrismaReportFeedback[] = [];
      for (const [userId, reportIds] of byUser) {
        const rows = await prisma.reportFeedback.findMany({
          where: { userId, reportId: { in: reportIds } },
          select: reportFeedbackSelect,
        });
        all.push(...rows);
      }
      return all;
    },
    (record) => ({ reportId: record.reportId, userId: record.userId }),
    ReportFeedbackPresenter.feedback,
  );
}

export function createReportLoaders(prisma: PrismaClient) {
  return {
    report: createReportLoader(prisma),
    reportTemplate: createReportTemplateLoader(prisma),
    reportsByParentRunId: createReportsByParentRunIdLoader(prisma),
    myReportFeedback: createMyReportFeedbackLoader(prisma),
  };
}
