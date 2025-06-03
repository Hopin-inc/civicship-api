import "reflect-metadata";
import "@/application/provider";
import logger from "@/infrastructure/logging";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { processDIDRequests } from "@/presentation/batch/syncDIDVC/syncDID";
import { processVCRequests } from "@/presentation/batch/syncDIDVC/syncVC";

export async function syncDIDVC() {
  logger.info("🚀 Starting DID/VC synchronization batch");

  const issuer = container.resolve<PrismaClientIssuer>("prismaClientIssuer");
  const client = container.resolve<DIDVCServerClient>("DIDVCServerClient");

  try {
    logger.info("🔄 Processing DID issuance requests...");
    const didResult = await processDIDRequests(issuer, client);
    logger.info(
      `📦 DID Results: ${didResult.total} total, ` +
        `${didResult.successCount} succeeded, ` +
        `${didResult.failureCount} failed, ` +
        `${didResult.skippedCount} skipped.`,
    );

    logger.info("🔄 Processing VC issuance requests...");
    const vcResult = await processVCRequests(issuer, client);
    logger.info(
      `📦 VC Results: ${vcResult.total} total, ` +
        `${vcResult.successCount} succeeded, ` +
        `${vcResult.failureCount} failed, ` +
        `${vcResult.skippedCount} skipped.`,
    );

    logger.info("✅ DID/VC synchronization batch completed");
  } catch (error) {
    logger.error("💥 Batch process error:", error);
  }
}

syncDIDVC()
  .then(() => {
    console.log("✅ Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error occurred:", err);
    process.exit(1);
  });
