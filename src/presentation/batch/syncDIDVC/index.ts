import "reflect-metadata";
import "@/application/provider";
import logger from "@/infrastructure/logging";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { processDIDRequests } from "@/presentation/batch/syncDIDVC/syncDID";
import { processVCRequests } from "@/presentation/batch/syncDIDVC/syncVC";
import { DIDIssuanceService } from "@/application/domain/account/identity/didIssuanceRequest/service";
import { VCIssuanceRequestService } from "@/application/domain/experience/evaluation/vcIssuanceRequest/service";
import NotificationService from "@/application/domain/notification/service";

export async function syncDIDVC() {
  logger.info("🚀 Starting DID/VC synchronization batch");

  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  const client = container.resolve<DIDVCServerClient>("DIDVCServerClient");
  const didService = container.resolve<DIDIssuanceService>("DIDIssuanceService");
  const vcService = container.resolve<VCIssuanceRequestService>("VCIssuanceRequestService");
  const notificationService = container.resolve<NotificationService>("NotificationService");

  try {
    logger.info("🔄 Processing DID issuance requests...");
    const didResult = await processDIDRequests(issuer, client, didService);
    logger.info(
      `📦 DID Results: ${didResult.total} total, ` +
        `${didResult.successCount} succeeded, ` +
        `${didResult.failureCount} failed, ` +
        `${didResult.skippedCount} skipped.`,
    );

    logger.info("🔄 Processing VC issuance requests...");
    const vcResult = await processVCRequests(issuer, client, vcService, notificationService);
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
