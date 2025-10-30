import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { IdentityPlatform, VcIssuanceStatus } from "@prisma/client";
import logger from "@/infrastructure/logging";
import { markFailedRequests, markExpiredRequests } from "@/presentation/batch/syncDIDVC/utils";
import { VCIssuanceRequestService } from "@/application/domain/experience/evaluation/vcIssuanceRequest/service";
import NotificationService from "@/application/domain/notification/service";
import { evaluationInclude } from "@/application/domain/experience/evaluation/data/type";
import { IContext } from "@/types/server";
import axios from "axios";

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

  for (const request of requests) {
    try {
      const phoneIdentity = request.user.identities.find(
        (identity) => identity.platform === IdentityPlatform.PHONE,
      );
      if (!phoneIdentity) {
        logger.warn(`⚠️ No phone identity for user ${request.userId}`);
        skippedCount++;
        continue;
      }

      let { token, isValid } = vcService.evaluateTokenValidity(phoneIdentity);

      if (!isValid && phoneIdentity.refreshToken) {
        const refreshed = await vcService.refreshAuthToken(
          phoneIdentity.uid,
          phoneIdentity.refreshToken,
        );

        if (refreshed) {
          token = refreshed.authToken;
          isValid = true;
        } else {
          logger.warn(`Token refresh failed for ${phoneIdentity.uid}, skipping request`);
          // optional: mark error to DB here
          failureCount++;
          continue;
        }
      }

      if (!token || !isValid) {
        logger.warn(`❌ No valid token after refresh for user ${request.userId}`);
        skippedCount++;
        continue;
      }

      const jobStatus = await client.call<{
        status: string;
        result?: { recordId: string };
      }>(phoneIdentity.uid, token || "", `/vc/connectionless/job/${request.jobId}`, "GET");

      if (jobStatus === null) {
        logger.warn(`External API call failed for VC job ${request.jobId}, keeping PENDING status`);
        await issuer.internal(async (tx) => {
          await tx.vcIssuanceRequest.update({
            where: { id: request.id },
            data: {
              errorMessage: "External API call failed during sync",
              retryCount: { increment: 1 },
            },
          });
        });
        skippedCount++;
        continue;
      }

      if (jobStatus?.status === "completed" && jobStatus.result?.recordId) {
        const vc = await issuer.internal(async (tx) => {
          return tx.vcIssuanceRequest.update({
            where: { id: request.id },
            data: {
              status: VcIssuanceStatus.COMPLETED,
              vcRecordId: jobStatus.result?.recordId,
              completedAt: new Date(),
            },
          });
        });
        logger.info(`✅ VC completed: ${request.id}`);

        const evaluation = await issuer.internal(async (tx) => {
          return tx.evaluation.findUnique({
            where: { id: vc.evaluationId },
            include: evaluationInclude,
          });
        });

        if (!evaluation) {
          logger.warn(`⚠️ Evaluation not found for request: ${request.id}`);
          continue;
        }

        if (!evaluation.participation.communityId) {
          logger.warn(`⚠️ missing communityId for request: ${request.id}`);
          continue;
        }
        const communityId = evaluation?.participation.communityId;
        const ctx = { communityId, issuer } as IContext;

        try {
          await notificationService.pushCertificateIssuedMessage(ctx, evaluation);
        } catch (error) {
          logger.error(
            `Failed to send certificate issued notification for request ${request.id}`,
            error,
          );
        }

        successCount++;
      } else if (jobStatus?.status === "failed") {
        await issuer.internal(async (tx) => {
          await tx.vcIssuanceRequest.update({
            where: { id: request.id },
            data: {
              status: VcIssuanceStatus.FAILED,
              errorMessage: "VC issuance failed on server",
            },
          });
        });
        logger.error(`❌ VC failed: ${request.id}`);
        failureCount++;
      } else {
        await issuer.internal(async (tx) => {
          await tx.vcIssuanceRequest.update({
            where: { id: request.id },
            data: { retryCount: { increment: 1 } },
          });
        });
        skippedCount++;
      }
    } catch (error) {
      logger.error(`💥 Error in VC request ${request.id}:`, error);

      // HTTPステータスコード別のエラーハンドリング
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 404) {
          // 404: ジョブが存在しない → 即座にFAILED、リトライしない
          await issuer.internal(async (tx) => {
            await tx.vcIssuanceRequest.update({
              where: { id: request.id },
              data: {
                status: VcIssuanceStatus.FAILED,
                errorMessage: `NOT_FOUND (HTTP 404): Job ${request.jobId} not found on external API`,
                retryCount: 999, // 最大値を超える値を設定してリトライ対象外に
              },
            });
          });
          logger.warn(
            `⚠️ VC request ${request.id} marked as FAILED (404 - Job not found: ${request.jobId})`,
          );
          failureCount++;
          continue;
        }

        if (status === 401 || status === 403) {
          // 認証エラー → トークンが無効、最大3回までリトライ
          const newRetryCount = request.retryCount + 1;
          await issuer.internal(async (tx) => {
            await tx.vcIssuanceRequest.update({
              where: { id: request.id },
              data: {
                status: newRetryCount >= 3 ? VcIssuanceStatus.FAILED : VcIssuanceStatus.PROCESSING,
                retryCount: { increment: 1 },
                errorMessage: `UNAUTHORIZED (HTTP ${status}): Authentication failed`,
              },
            });
          });
          logger.warn(
            `⚠️ VC request ${request.id}: Authentication failed (HTTP ${status}), retry ${newRetryCount}/3`,
          );
          failureCount++;
          continue;
        }

        // 400系エラー（404, 401, 403以外） → リトライ不要
        if (status && status >= 400 && status < 500) {
          await issuer.internal(async (tx) => {
            await tx.vcIssuanceRequest.update({
              where: { id: request.id },
              data: {
                status: VcIssuanceStatus.FAILED,
                errorMessage: `CLIENT_ERROR (HTTP ${status}): ${error.message}`,
                retryCount: 999,
              },
            });
          });
          logger.warn(`⚠️ VC request ${request.id} marked as FAILED (HTTP ${status})`);
          failureCount++;
          continue;
        }

        // 500系エラーやその他 → リトライ対象
        await issuer.internal(async (tx) => {
          await tx.vcIssuanceRequest.update({
            where: { id: request.id },
            data: {
              retryCount: { increment: 1 },
              errorMessage: `SERVER_ERROR (HTTP ${status || "unknown"}): ${error.message}`,
            },
          });
        });
        failureCount++;
        continue;
      }

      // Axios以外のエラー → 既存のロジック
      await issuer.internal(async (tx) => {
        await tx.vcIssuanceRequest.update({
          where: { id: request.id },
          data: {
            retryCount: { increment: 1 },
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          },
        });
      });
      failureCount++;
    }
  }

  await markFailedRequests(issuer, "vcIssuanceRequest", VcIssuanceStatus.FAILED);
  await markExpiredRequests(issuer, "vcIssuanceRequest", VcIssuanceStatus.FAILED);

  return {
    total: requests.length,
    successCount,
    failureCount,
    skippedCount,
  };
}
