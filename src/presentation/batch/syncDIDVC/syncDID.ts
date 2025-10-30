import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { DidIssuanceStatus, IdentityPlatform } from "@prisma/client";
import logger from "@/infrastructure/logging";
import { markFailedRequests, markExpiredRequests } from "@/presentation/batch/syncDIDVC/utils";
import { DIDIssuanceService } from "@/application/domain/account/identity/didIssuanceRequest/service";
import axios from "axios";

type BatchResult = {
  total: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
};

export async function processDIDRequests(
  issuer: PrismaClientIssuer,
  client: DIDVCServerClient,
  didService: DIDIssuanceService,
): Promise<BatchResult> {
  const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7日前

  const requests = await issuer.internal(async (tx) => {
    return tx.didIssuanceRequest.findMany({
      where: {
        status: DidIssuanceStatus.PROCESSING, // PROCESSINGのみ対象
        jobId: { not: null },
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

  logger.info(`📡 Found ${requests.length} processing DID issuance requests`);

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

      let { token, isValid } = didService.evaluateTokenValidity(phoneIdentity);

      if (!isValid && phoneIdentity.refreshToken) {
        const refreshed = await didService.refreshAuthToken(
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
        result?: { did: string };
      }>(phoneIdentity.uid, token || "", `/did/job/${request.jobId}`, "GET");

      logger.debug(`jobStatus: ${JSON.stringify(jobStatus, null, 2)}`);

      if (jobStatus === null) {
        logger.warn(
          `External API call failed for DID job ${request.jobId}, keeping PENDING status`,
        );
        await issuer.internal(async (tx) => {
          await tx.didIssuanceRequest.update({
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

      if (jobStatus?.status === "completed" && jobStatus.result?.did) {
        await issuer.internal(async (tx) => {
          await tx.didIssuanceRequest.update({
            where: { id: request.id },
            data: {
              status: DidIssuanceStatus.COMPLETED,
              didValue: jobStatus.result?.did,
              completedAt: new Date(),
            },
          });
        });
        logger.info(`✅ DID completed: ${request.id}`);
        successCount++;
      } else if (jobStatus?.status === "failed") {
        await issuer.internal(async (tx) => {
          await tx.didIssuanceRequest.update({
            where: { id: request.id },
            data: {
              status: DidIssuanceStatus.FAILED,
              errorMessage: "DID issuance failed on server",
            },
          });
        });
        logger.error(`❌ DID failed: ${request.id}`);
        failureCount++;
      } else {
        await issuer.internal(async (tx) => {
          await tx.didIssuanceRequest.update({
            where: { id: request.id },
            data: { retryCount: { increment: 1 } },
          });
        });
        skippedCount++;
      }
    } catch (error) {
      logger.error(`💥 Error in DID request ${request.id}:`, error);

      // HTTPステータスコード別のエラーハンドリング
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 404) {
          // 404: ジョブが存在しない → 即座にFAILED、リトライしない
          await issuer.internal(async (tx) => {
            await tx.didIssuanceRequest.update({
              where: { id: request.id },
              data: {
                status: DidIssuanceStatus.FAILED,
                errorMessage: `NOT_FOUND (HTTP 404): Job ${request.jobId} not found on external API`,
                retryCount: 999, // 最大値を超える値を設定してリトライ対象外に
              },
            });
          });
          logger.warn(
            `⚠️ DID request ${request.id} marked as FAILED (404 - Job not found: ${request.jobId})`,
          );
          failureCount++;
          continue;
        }

        if (status === 401 || status === 403) {
          // 認証エラー → トークンが無効、最大3回までリトライ
          const newRetryCount = request.retryCount + 1;
          await issuer.internal(async (tx) => {
            await tx.didIssuanceRequest.update({
              where: { id: request.id },
              data: {
                status: newRetryCount >= 3 ? DidIssuanceStatus.FAILED : DidIssuanceStatus.PROCESSING,
                retryCount: { increment: 1 },
                errorMessage: `UNAUTHORIZED (HTTP ${status}): Authentication failed`,
              },
            });
          });
          logger.warn(
            `⚠️ DID request ${request.id}: Authentication failed (HTTP ${status}), retry ${newRetryCount}/3`,
          );
          failureCount++;
          continue;
        }

        // 400系エラー（404, 401, 403以外） → リトライ不要
        if (status && status >= 400 && status < 500) {
          await issuer.internal(async (tx) => {
            await tx.didIssuanceRequest.update({
              where: { id: request.id },
              data: {
                status: DidIssuanceStatus.FAILED,
                errorMessage: `CLIENT_ERROR (HTTP ${status}): ${error.message}`,
                retryCount: 999,
              },
            });
          });
          logger.warn(`⚠️ DID request ${request.id} marked as FAILED (HTTP ${status})`);
          failureCount++;
          continue;
        }

        // 500系エラーやその他 → リトライ対象
        await issuer.internal(async (tx) => {
          await tx.didIssuanceRequest.update({
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
        await tx.didIssuanceRequest.update({
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

  await markFailedRequests(issuer, "didIssuanceRequest", DidIssuanceStatus.FAILED);
  await markExpiredRequests(issuer, "didIssuanceRequest", DidIssuanceStatus.FAILED, 7);

  return {
    total: requests.length,
    successCount,
    failureCount,
    skippedCount,
  };
}
