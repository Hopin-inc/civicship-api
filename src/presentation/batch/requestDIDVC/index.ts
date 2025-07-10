import "reflect-metadata";
import "@/application/provider";
import logger from "@/infrastructure/logging";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { DIDIssuanceService } from "@/application/domain/account/identity/didIssuanceRequest/service";
import { VCIssuanceRequestService } from "@/application/domain/experience/evaluation/vcIssuanceRequest/service";
import { createDIDRequests } from "./requestDID";
import { IContext } from "@/types/server";
import { createVCRequests } from "@/presentation/batch/requestDIDVC/requestVC";
import VCIssuanceRequestConverter from "@/application/domain/experience/evaluation/vcIssuanceRequest/data/converter";

/**
 * EvaluationとIdentityに基づいて、
 * - 未リクエストのDIDを送信
 * - Evaluation(PASSED)だがVCリクエスト未発行のユーザーにVCを送信
 */
export async function requestDIDVC() {
  logger.info("🚀 Starting DID & VC request batch");

  const issuer = container.resolve<PrismaClientIssuer>("prismaClientIssuer");
  const didService = container.resolve<DIDIssuanceService>("DIDIssuanceService");
  const vcService = container.resolve<VCIssuanceRequestService>("VCIssuanceRequestService");
  const vcConverter = container.resolve<VCIssuanceRequestConverter>("VCIssuanceRequestConverter");
  const ctx: IContext = {};

  try {
    // --- DID ---
    const didResult = await createDIDRequests(issuer, didService, ctx);
    logger.info(
      `📦 DID Requests: ${didResult.total} total, ` +
        `${didResult.successCount} succeeded, ` +
        `${didResult.failureCount} failed, ` +
        `${didResult.skippedCount} skipped.`,
    );

    // --- VC ---
    const vcResult = await createVCRequests(issuer, vcService, vcConverter, ctx);
    logger.info(
      `📦 VC Requests: ${vcResult.total} total, ` +
        `${vcResult.successCount} succeeded, ` +
        `${vcResult.failureCount} failed, ` +
        `${vcResult.skippedCount} skipped.`,
    );

    logger.info("✅ DID & VC request batch completed");
  } catch (error) {
    logger.error("💥 Error in DID/VC request batch", error);
  }
}

requestDIDVC()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Unhandled error:", err);
    process.exit(1);
  });
