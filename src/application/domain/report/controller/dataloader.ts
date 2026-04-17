import { PrismaClient } from "@prisma/client";
import {
  createLoaderById,
  createHasManyLoaderByKey,
} from "@/presentation/graphql/dataloader/utils";
import {
  reportSelect,
  reportTemplateSelect,
  PrismaReport,
  PrismaReportTemplate,
} from "@/application/domain/report/data/type";
import ReportPresenter from "@/application/domain/report/presenter";
import { GqlReport, GqlReportTemplate } from "@/types/graphql";

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

export function createReportLoaders(prisma: PrismaClient) {
  return {
    report: createReportLoader(prisma),
    reportTemplate: createReportTemplateLoader(prisma),
    reportsByParentRunId: createReportsByParentRunIdLoader(prisma),
  };
}
