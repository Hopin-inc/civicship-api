import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IdentityPlatform, EvaluationStatus, VcIssuanceStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import { VCIssuanceRequestService } from "@/application/domain/experience/evaluation/vcIssuanceRequest/service";
import { evaluationInclude } from "@/application/domain/experience/evaluation/data/type";
import VCIssuanceRequestConverter from "@/application/domain/experience/evaluation/vcIssuanceRequest/data/converter";

type BatchResult = {
  total: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
};

/**
 * EvaluationがPASSEDのユーザーで、VCリクエスト未作成のものに対してVCを発行する
 */
export async function createVCRequests(
  issuer: PrismaClientIssuer,
  vcService: VCIssuanceRequestService,
  vcConverter: VCIssuanceRequestConverter,
  ctx: IContext,
): Promise<BatchResult> {
  const evaluations = await issuer.public(ctx, async (tx) => {
    return tx.evaluation.findMany({
      where: {
        status: EvaluationStatus.PASSED,
        participation: {
          user: {
            identities: {
              some: { platform: IdentityPlatform.PHONE },
            },
          },
        },
        OR: [
          {
            participation: {
              user: {
                vcIssuanceRequests: {
                  some: {
                    status: VcIssuanceStatus.PENDING,
                    jobId: null,
                  },
                },
              },
            },
          },
          {
            participation: {
              user: {
                vcIssuanceRequests: {
                  none: {},
                },
              },
            },
          },
        ],
      },
      include: evaluationInclude,
    });
  });

  logger.info(`🆕 Found ${evaluations.length} PASSED evaluations without VC request`);

  let successCount = 0;
  let failureCount = 0;
  let skippedCount = 0;

  for (const evaluation of evaluations) {
    const user = evaluation.participation.user;
    const phoneIdentity = user?.identities.find((i) => i.platform === IdentityPlatform.PHONE);
    const vcRequest = evaluation.vcIssuanceRequest;

    if (!user?.id || !phoneIdentity?.uid) {
      logger.warn(`⚠️ Missing identity info: user=${user?.id}`);
      skippedCount++;
      continue;
    }

    if (vcRequest && (vcRequest.status !== VcIssuanceStatus.PENDING || vcRequest.jobId !== null)) {
      skippedCount++;
      continue;
    }

    try {
      const result = await vcService.requestVCIssuance(
        user.id,
        phoneIdentity.uid,
        vcConverter.toVCIssuanceRequestInput(evaluation),
        ctx,
        evaluation.id,
        vcRequest?.id,
      );

      if (result.success) {
        logger.info(`✅ VC requested: evaluation=${evaluation.id}, user=${user.id}`);
        successCount++;
      } else {
        logger.warn(`❌ VC request failed: evaluation=${evaluation.id}, user=${user.id}`);
        failureCount++;
      }
    } catch (err) {
      logger.error(`💥 Error requesting VC: evaluation=${evaluation.id}, user=${user.id}`, err);
      failureCount++;
    }
  }

  return {
    total: evaluations.length,
    successCount,
    failureCount,
    skippedCount,
  };
}
