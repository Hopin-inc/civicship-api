import "reflect-metadata";
import "@/application/provider";
import { container } from "tsyringe";
import { ReportStatus } from "@prisma/client";
import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";
import ReportUseCase from "@/application/domain/report/usecase";
import { IContext } from "@/types/server";
import { addDays, truncateToJstDate } from "@/application/domain/report/util";

export async function generateWeeklyReports() {
  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  const reportUseCase = container.resolve<ReportUseCase>("ReportUseCase");

  logger.debug("Starting weekly report generation batch...");

  const communities = await prismaClient.community.findMany({
    select: { id: true },
  });

  const yesterday = addDays(truncateToJstDate(new Date()), -1);
  const weekAgo = addDays(yesterday, -6);

  const ctx = { issuer, isAdmin: true } as IContext;

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const community of communities) {
    try {
      const existing = await prismaClient.report.findFirst({
        where: {
          communityId: community.id,
          variant: "WEEKLY_SUMMARY",
          periodFrom: weekAgo,
          periodTo: yesterday,
          status: { not: ReportStatus.REJECTED },
        },
        select: { id: true },
      });
      if (existing) {
        logger.debug(`Skipping community ${community.id} — report already exists`);
        skipCount++;
        continue;
      }

      await reportUseCase.generateReport(
        {
          input: {
            communityId: community.id,
            variant: "WEEKLY_SUMMARY" as never,
            periodFrom: weekAgo,
            periodTo: yesterday,
          },
          permission: { communityId: community.id },
        },
        ctx,
      );
      successCount++;
      logger.debug(`Generated weekly report for community ${community.id}`);
    } catch (error) {
      errorCount++;
      logger.error(`Failed to generate weekly report for community ${community.id}:`, error);
    }
  }

  logger.debug(
    `Weekly report batch completed: ${successCount} generated, ${skipCount} skipped, ${errorCount} errors`,
  );
}
