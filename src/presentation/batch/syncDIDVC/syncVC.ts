import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { IdentityPlatform, VcIssuanceStatus } from "@prisma/client";
import logger from "@/infrastructure/logging";
import { markFailedRequests } from "@/presentation/batch/syncDIDVC/utils";

type BatchResult = {
  total: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
};

export async function processVCRequests(
  issuer: PrismaClientIssuer,
  client: DIDVCServerClient,
): Promise<BatchResult> {
  const requests = await issuer.internal(async (tx) => {
    return tx.vcIssuanceRequest.findMany({
      where: {
        status: VcIssuanceStatus.PROCESSING,
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

      const jobStatus = await client.call<{
        status: string;
        result?: { recordId: string };
      }>(
        phoneIdentity.uid,
        phoneIdentity.authToken || "",
        `/vc/jobs/connectionless/${request.jobId}`,
        "GET",
      );

      if (jobStatus?.status === VcIssuanceStatus.COMPLETED && jobStatus.result?.recordId) {
        await issuer.internal(async (tx) => {
          await tx.vcIssuanceRequest.update({
            where: { id: request.id },
            data: {
              status: VcIssuanceStatus.COMPLETED,
              vcRecordId: jobStatus.result?.recordId,
              completedAt: new Date(),
            },
          });
        });
        logger.info(`✅ VC completed: ${request.id}`);
        successCount++;
      } else if (jobStatus?.status === VcIssuanceStatus.FAILED) {
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

  return {
    total: requests.length,
    successCount,
    failureCount,
    skippedCount,
  };
}
