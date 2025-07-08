import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { IdentityPlatform, VcIssuanceStatus } from "@prisma/client";
import logger from "@/infrastructure/logging";
import { markFailedRequests } from "@/presentation/batch/syncDIDVC/utils";
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
  const requests = await issuer.internal(async (tx) => {
    return tx.vcIssuanceRequest.findMany({
      where: {
        status: { not: VcIssuanceStatus.COMPLETED },
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

      let { token, isValid } = vcService.evaluateTokenValidity(phoneIdentity);

      if (!isValid && phoneIdentity.refreshToken) {
        try {
          const refreshed = await vcService.refreshAuthToken(
            phoneIdentity.uid,
            phoneIdentity.refreshToken,
          );
          token = refreshed.authToken;
          isValid = true;
        } catch (error) {
          logger.error(`🔁 Token refresh failed for ${phoneIdentity.uid}`, error);
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
      }>(phoneIdentity.uid, token || "", `/vc/jobs/connectionless/${request.jobId}`, "GET");

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

        await notificationService.pushCertificateIssuedMessage(ctx, evaluation);

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
