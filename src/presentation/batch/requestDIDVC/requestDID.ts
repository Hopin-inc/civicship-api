import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { DidIssuanceRequest, DidIssuanceStatus, IdentityPlatform } from "@prisma/client";
import logger from "@/infrastructure/logging";
import { IContext } from "@/types/server";
import { DIDIssuanceService } from "@/application/domain/account/identity/didIssuanceRequest/service";

const STUCK_RETRY_THRESHOLD = 3;

type BatchResult = {
  total: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
};

/**
 * 未リクエストユーザーを検索し、DIDリクエストを作成・送信するバッチ処理
 */
export async function createDIDRequests(
  issuer: PrismaClientIssuer,
  didService: DIDIssuanceService,
  ctx: IContext,
  limit?: number,
): Promise<BatchResult> {
  const users = await issuer.public(ctx, async (tx) => {
    return tx.user.findMany({
      where: {
        identities: { some: { platform: IdentityPlatform.PHONE } },
        OR: [
          {
            didIssuanceRequests: {
              none: {},
            },
          },
          {
            didIssuanceRequests: {
              some: {
                jobId: null,
              },
            },
          },
          {
            didIssuanceRequests: {
              some: {
                status: DidIssuanceStatus.FAILED,
                didValue: null,
              },
            },
          },
          {
            didIssuanceRequests: {
              some: {
                status: DidIssuanceStatus.PROCESSING,
                retryCount: {
                  gte: STUCK_RETRY_THRESHOLD,
                },
              },
            },
          },
        ],
      },
      include: {
        identities: { where: { platform: IdentityPlatform.PHONE } },
        didIssuanceRequests: true,
      },
      take: limit,
    });
  });

  logger.info(`🆕 Found ${users.length} users for DID issuance processing`);

  let successCount = 0;
  let failureCount = 0;

  const needsReset = (request: DidIssuanceRequest) => {
    return (
      (request.status === DidIssuanceStatus.FAILED && request.didValue === null) ||
      (request.status === DidIssuanceStatus.PROCESSING && request.retryCount >= STUCK_RETRY_THRESHOLD)
    );
  };

  for (const user of users) {
    const phoneIdentity = user.identities.find(
      (identity) => identity.platform === IdentityPlatform.PHONE,
    );
    if (!phoneIdentity) {
      logger.warn(`⚠️ No phone identity for user ${user.id}`);
      continue;
    }

    const existingRequest = user.didIssuanceRequests?.[0];

    if (existingRequest && needsReset(existingRequest)) {
      logger.info(
        `🔄 Resetting request ${existingRequest.id} for user ${user.id} ` +
          `(status: ${existingRequest.status}, retryCount: ${existingRequest.retryCount})`,
      );

      await issuer.public(ctx, async (tx) => {
        await tx.didIssuanceRequest.update({
          where: { id: existingRequest.id },
          data: {
            status: DidIssuanceStatus.PENDING,
            jobId: null,
            retryCount: 0,
            errorMessage: `Auto-reset: Previous status=${existingRequest.status}, retryCount=${existingRequest.retryCount}`,
          },
        });
      });
    }

    try {
      const result = await didService.requestDIDIssuance(
        user.id,
        phoneIdentity.uid,
        ctx,
        existingRequest?.id,
      );

      if (result.success) {
        logger.info(`✅ DID request created: user=${user.id}, request=${result.requestId}`);
        successCount++;
      } else {
        logger.warn(`❌ DID request failed for user ${user.id}`);
        failureCount++;
      }
    } catch (err) {
      logger.error(`💥 Error requesting DID for user ${user.id}:`, err);
      failureCount++;
    }
  }

  return {
    total: users.length,
    successCount,
    failureCount,
    skippedCount: 0,
  };
}
