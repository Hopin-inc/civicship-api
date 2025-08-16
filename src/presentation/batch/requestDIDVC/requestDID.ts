import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IdentityPlatform } from "@prisma/client";
import logger from "@/infrastructure/logging";
import { IContext } from "@/types/server";
import { DIDIssuanceService } from "@/application/domain/account/identity/didIssuanceRequest/service";

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
                // status: DidIssuanceStatus.PENDING,
                jobId: null,
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

  logger.info(`🆕 Found ${users.length} users without DID issuance request`);

  let successCount = 0;
  let failureCount = 0;

  for (const user of users) {
    const phoneIdentity = user.identities.find(
      (identity) => identity.platform === IdentityPlatform.PHONE,
    );
    if (!phoneIdentity) {
      logger.warn(`⚠️ No phone identity for user ${user.id}`);
      continue;
    }

    const existingRequest = user.didIssuanceRequests?.find((r) => r.jobId === null);

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
