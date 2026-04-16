import "reflect-metadata";
import "@/application/provider";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";
import ReportUseCase from "@/application/domain/report/usecase";
import { IContext } from "@/types/server";

/**
 * Daily batch: refresh materialized views that back the transaction-based
 * report dataset.
 *
 * Trigger this via Cloud Scheduler (or an equivalent) once per day, after
 * the JST day boundary (e.g. 01:00 JST) so the previous day is fully
 * captured.
 */
export async function refreshReportViews() {
  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  const reportUseCase = container.resolve<ReportUseCase>("ReportUseCase");

  logger.debug("🔄 Starting report views refresh batch...");

  const ctx = { issuer } as IContext;

  try {
    await reportUseCase.refreshAllReportViews(ctx);
    logger.debug("✅ Report views refresh batch completed successfully");
  } catch (error) {
    logger.error("❌ Error in report views refresh batch:", error);
    throw error;
  }
}
