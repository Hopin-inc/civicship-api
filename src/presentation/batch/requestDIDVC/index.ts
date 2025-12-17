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
import { checkBit } from "@/utils/misc";

/**
 * EvaluationとIdentityに基づいて、
 * - 未リクエストのDIDを送信
 * - Evaluation(PASSED)だがVCリクエスト未発行のユーザーにVCを送信
 */
export async function requestDIDVC() {
  /**
   * BATCH_DID_VC_REQUEST_MODE:
   *   3: DID 実行 / VC 実行
   *   2: DID 実行 / VC 無効
   *   1: DID 無効 / VC 実行
   *   0: DID 無効 / VC 無効
   */
  const requestMode = process.env.BATCH_DID_VC_REQUEST_MODE ? parseInt(process.env.BATCH_DID_VC_REQUEST_MODE) : 3; // デフォルトで全て実行
  const executeDID = checkBit(requestMode, 2);
  const executeVC = checkBit(requestMode, 1);

  let limit = process.env.BATCH_LIMIT ? parseInt(process.env.BATCH_LIMIT) : undefined;
  if (limit && limit > 0) {
    logger.info(`🚀 Starting DID & VC request batch (MODE: ${ requestMode }, LIMIT: ${ limit })`, {
      executeDID,
      executeVC,
    });
  } else {
    limit = undefined;
    logger.info(`🚀 Starting DID & VC request batch (MODE: ${ requestMode })`, {
      executeDID,
      executeVC,
    });
  }

  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  const didService = container.resolve<DIDIssuanceService>("DIDIssuanceService");
  const vcService = container.resolve<VCIssuanceRequestService>("VCIssuanceRequestService");
  const vcConverter = container.resolve<VCIssuanceRequestConverter>("VCIssuanceRequestConverter");
  const ctx = { issuer } as IContext;

  try {
    // --- DID ---
    if (executeDID) {
      const didResult = await createDIDRequests(issuer, didService, ctx, limit);
      logger.info(
        `📦 DID Requests: ${ didResult.total } total, ` +
        `${ didResult.successCount } succeeded, ` +
        `${ didResult.failureCount } failed, ` +
        `${ didResult.skippedCount } skipped.`,
      );
    }

    // --- VC ---
    if (executeVC) {
      const vcResult = await createVCRequests(issuer, vcService, vcConverter, ctx, limit);
      logger.info(
        `📦 VC Requests: ${ vcResult.total } total, ` +
        `${ vcResult.successCount } succeeded, ` +
        `${ vcResult.failureCount } failed, ` +
        `${ vcResult.skippedCount } skipped.`,
      );
    }

    logger.info("✅ DID & VC request batch completed");
  } catch (error) {
    logger.error("💥 Error in DID/VC request batch", error);
  }
}
