import "reflect-metadata";
import "@/application/provider";
import { container } from "tsyringe";
import { ReportStatus } from "@prisma/client";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";
import ReportUseCase from "@/application/domain/report/usecase";
import { IContext } from "@/types/server";
import { GqlReportStatus, GqlReportVariant } from "@/types/graphql";
import { addDays, truncateToJstDate } from "@/application/domain/report/util";

export async function generateWeeklyReports() {
  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  const reportUseCase = container.resolve<ReportUseCase>("ReportUseCase");

  logger.debug("Starting weekly report generation batch...");

  const ctx = { issuer, isAdmin: true } as IContext;

  const communities = await issuer.internal((tx) =>
    tx.community.findMany({ select: { id: true } }),
  );

  const yesterday = addDays(truncateToJstDate(new Date()), -1);
  const weekAgo = addDays(yesterday, -6);

  let successCount = 0;
  let alreadyExistsCount = 0;
  let zeroActivitySkipCount = 0;
  let errorCount = 0;

  for (const community of communities) {
    try {
      // Intentionally skip only DRAFT/APPROVED/PUBLISHED/SKIPPED reports.
      // REJECTED reports are treated as "not existing" so the batch
      // retries generation after an admin rejection. SUPERSEDED
      // reports are also excluded since they've been replaced.
      // SKIPPED is included here so we don't re-run generateReport on
      // a community whose week was already recorded as zero-activity —
      // the SKIPPED row is the final artefact for that period.
      const existing = await issuer.internal((tx) =>
        tx.report.findFirst({
          where: {
            communityId: community.id,
            variant: GqlReportVariant.WeeklySummary,
            periodFrom: weekAgo,
            periodTo: yesterday,
            status: { notIn: [ReportStatus.REJECTED, ReportStatus.SUPERSEDED] },
          },
          select: { id: true },
        }),
      );
      if (existing) {
        logger.debug(`Skipping community ${community.id} — report already exists`);
        alreadyExistsCount++;
        continue;
      }

      const result = await reportUseCase.generateReport(
        {
          input: {
            communityId: community.id,
            variant: GqlReportVariant.WeeklySummary,
            periodFrom: weekAgo,
            periodTo: yesterday,
          },
          permission: { communityId: community.id },
        },
        ctx,
      );
      // GenerateReportSuccess is the only non-error return; a SKIPPED row
      // comes back here the same way — distinguished by `status`.
      if (
        result.__typename === "GenerateReportSuccess" &&
        result.report.status === GqlReportStatus.Skipped
      ) {
        zeroActivitySkipCount++;
        logger.debug(
          `Skipped weekly report for community ${community.id} — ${result.report.skipReason ?? "no reason recorded"}`,
        );
      } else {
        successCount++;
        logger.debug(`Generated weekly report for community ${community.id}`);
      }
    } catch (error) {
      errorCount++;
      logger.error(`Failed to generate weekly report for community ${community.id}:`, error);
    }
  }

  logger.debug(
    `Weekly report batch completed: ${successCount} generated, ` +
      `${zeroActivitySkipCount} skipped (no activity), ` +
      `${alreadyExistsCount} skipped (already exists), ` +
      `${errorCount} errors`,
  );
}
