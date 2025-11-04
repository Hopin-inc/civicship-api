import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { IdentityPlatform, VcIssuanceStatus } from "@prisma/client";
import logger from "@/infrastructure/logging";
import { markExpiredVCRequests } from "@/presentation/batch/syncDIDVC/utils";
import { VCIssuanceRequestService } from "@/application/domain/experience/evaluation/vcIssuanceRequest/service";
import NotificationService from "@/application/domain/notification/service";
import { evaluationInclude } from "@/application/domain/experience/evaluation/data/type";
import { IContext } from "@/types/server";

type BatchResult = {
  total: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
};

export async function processVCRequests(
  issuer: PrismaClientIssuer,
  client: DIDVCServerClient,
  vcService: VCIssuanceRequestService,
  notificationService: NotificationService,
): Promise<BatchResult> {
  const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7日前

  const requests = await issuer.internal(async (tx) => {
    return tx.vcIssuanceRequest.findMany({
      where: {
        status: VcIssuanceStatus.PROCESSING, // PROCESSINGのみ対象
        jobId: { not: null },
        vcRecordId: null,
        retryCount: { lt: 5 },
        // processedAtが7日以内のもののみ（nullまたは7日以内）
        OR: [{ processedAt: null }, { processedAt: { gte: cutoffDate } }],
      },
      include: {
        user: {
          include: {
            identities: {
              where: { platform: IdentityPlatform.PHONE },
            },
          },
        },
      },
    });
  });

  logger.info(`📡 Found ${requests.length} processing VC issuance requests`);

  let successCount = 0;
  let failureCount = 0;
  let skippedCount = 0;

  // 簡潔なループ: Service層に委譲
  for (const request of requests) {
    try {
      const ctx: IContext = { issuer } as IContext;
      const result = await vcService.syncJobStatus(request, ctx);

      // VC完了時は通知を送信
      if (result.status === "completed") {
        const evaluation = await issuer.internal(async (tx) => {
          return tx.evaluation.findUnique({
            where: { id: request.evaluationId },
            include: evaluationInclude,
          });
        });

        if (!evaluation) {
          logger.warn(
            `⚠️ Evaluation not found for completed VC request: ${request.id}, evaluationId: ${request.evaluationId}`,
          );
        } else if (evaluation.participation.communityId) {
          const notificationCtx = {
            communityId: evaluation.participation.communityId,
            issuer,
          } as IContext;

          try {
            await notificationService.pushCertificateIssuedMessage(notificationCtx, evaluation);
          } catch (error) {
            logger.error(
              `Failed to send certificate issued notification for request ${request.id}`,
              error,
            );
          }
        }
      }

      switch (result.status) {
        case "completed":
          successCount++;
          break;
        case "failed":
          failureCount++;
          break;
        case "retrying":
        case "skipped":
          skippedCount++;
          break;
      }
    } catch (error) {
      // Service層で処理されなかった予期しないエラー
      logger.error(`Unexpected error in VC sync for request ${request.id}:`, {
        requestId: request.id,
        userId: request.userId,
        evaluationId: request.evaluationId,
        jobId: request.jobId,
        status: request.status,
        retryCount: request.retryCount,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      failureCount++;
    }
  }

  await markExpiredVCRequests(issuer, {
    pending: VcIssuanceStatus.PENDING,
    processing: VcIssuanceStatus.PROCESSING,
    failed: VcIssuanceStatus.FAILED,
  });

  return {
    total: requests.length,
    successCount,
    failureCount,
    skippedCount,
  };
}
