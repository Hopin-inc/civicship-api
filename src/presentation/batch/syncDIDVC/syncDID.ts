import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { DidIssuanceStatus, IdentityPlatform } from "@prisma/client";
import logger from "@/infrastructure/logging";
import { markExpiredDIDRequests } from "@/presentation/batch/syncDIDVC/utils";
import { DIDIssuanceService } from "@/application/domain/account/identity/didIssuanceRequest/service";
import { IContext } from "@/types/server";

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

  // 簡潔なループ: Service層に委譲
  for (const request of requests) {
    try {
      const ctx: IContext = { issuer } as IContext;
      const result = await didService.syncJobStatus(request, ctx);

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
      logger.error(`Unexpected error in DID sync for ${request.id}:`, error);
      failureCount++;
    }
  }

  await markExpiredDIDRequests(issuer, {
    pending: DidIssuanceStatus.PENDING,
    processing: DidIssuanceStatus.PROCESSING,
    failed: DidIssuanceStatus.FAILED,
  });

  return {
    total: requests.length,
    successCount,
    failureCount,
    skippedCount,
  };
}
