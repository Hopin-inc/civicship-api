import "reflect-metadata";
import "@/application/provider";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";
import { ITransactionRepository } from "@/application/domain/transaction/data/interface";
import { IContext } from "@/types/server";

export async function refreshPointViews() {
  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  const transactionRepository = container.resolve<ITransactionRepository>("TransactionRepository");

  logger.debug("🔄 Starting point views refresh batch...");

  const ctx = { issuer } as IContext;

  try {
    await issuer.internal(async (tx) => {
      logger.debug("📊 Refreshing materialized view for current points...");
      const result = await transactionRepository.refreshCurrentPoints(ctx, tx);
      logger.debug(
        `✅ Successfully refreshed current points view. Processed ${result.length} records.`,
      );
    });

    logger.debug("✅ Point views refresh batch completed successfully");
  } catch (error) {
    logger.error("❌ Error in point views refresh batch:", error);
    throw error;
  }
}
