import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { DidIssuanceStatus, IdentityPlatform } from "@prisma/client";
import logger from "@/infrastructure/logging";
import { markFailedRequests } from "@/presentation/batch/syncDIDVC/utils";
import { DIDIssuanceService } from "@/application/domain/account/identity/didIssuanceRequest/service";

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
  const requests = await issuer.internal(async (tx) => {
    return tx.didIssuanceRequest.findMany({
      where: {
        status: { not: DidIssuanceStatus.COMPLETED },
        jobId: { not: null },
        retryCount: { lt: 5 },
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

  return {
    total: requests.length,
    successCount,
    failureCount,
    skippedCount,
  };
}
