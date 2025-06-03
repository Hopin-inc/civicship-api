import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { DidIssuanceStatus, IdentityPlatform } from "@prisma/client";
import logger from "@/infrastructure/logging";
import { markFailedRequests } from "@/presentation/batch/syncDIDVC/utils";

type BatchResult = {
  total: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
};

export async function processDIDRequests(
  issuer: PrismaClientIssuer,
  client: DIDVCServerClient,
): Promise<BatchResult> {
  const requests = await issuer.internal(async (tx) => {
    return tx.didIssuanceRequest.findMany({
      where: {
        status: DidIssuanceStatus.PROCESSING,
        jobId: { not: null },
        retryCount: { lt: 3 },
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

      const jobStatus = await client.call<{
        status: string;
        result?: { didValue: string };
      }>(phoneIdentity.uid, phoneIdentity.authToken || "", `/did/jobs/${request.jobId}`, "GET");

      if (jobStatus?.status === DidIssuanceStatus.COMPLETED && jobStatus.result?.didValue) {
        await issuer.internal(async (tx) => {
          await tx.didIssuanceRequest.update({
            where: { id: request.id },
            data: {
              status: DidIssuanceStatus.COMPLETED,
              didValue: jobStatus.result?.didValue,
              completedAt: new Date(),
            },
          });
        });
        logger.info(`✅ DID completed: ${request.id}`);
        successCount++;
      } else if (jobStatus?.status === DidIssuanceStatus.FAILED) {
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
