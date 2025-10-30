import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { DidIssuanceStatus, VcIssuanceStatus } from "@prisma/client";
import logger from "@/infrastructure/logging";

export async function markExpiredDIDRequests(
  issuer: PrismaClientIssuer,
  statuses: {
    pending: DidIssuanceStatus;
    processing: DidIssuanceStatus;
    failed: DidIssuanceStatus;
  },
  maxAgeDays?: number,
) {
  const maxAge = maxAgeDays ?? 7;
  const cutoffDate = new Date(Date.now() - maxAge * 24 * 60 * 60 * 1000);

  const expiredRequests = await issuer.internal(async (tx) => {
    return tx.didIssuanceRequest.findMany({
      where: {
        OR: [
          // パターン1: PROCESSING状態で processedAt から指定日数経過
          {
            status: statuses.processing,
            processedAt: { lt: cutoffDate, not: null },
          },
          // パターン2: PENDING状態で requestedAt から指定日数経過
          {
            status: statuses.pending,
            requestedAt: { lt: cutoffDate },
          },
          // パターン3: リトライ回数超過
          {
            status: { in: [statuses.pending, statuses.processing] },
            retryCount: { gte: 5 },
          },
        ],
      },
    });
  });

  if (expiredRequests.length > 0) {
    logger.warn(
      `Marking ${expiredRequests.length} DID requests as failed (expired or retry limit exceeded)`,
    );

    // 詳細ログ
    expiredRequests.forEach((req) => {
      logger.debug(`Expiring DID request`, {
        requestId: req.id,
        jobId: req.jobId,
        processedAt: req.processedAt,
        requestedAt: req.requestedAt,
        retryCount: req.retryCount,
      });
    });

    await issuer.internal(async (tx) => {
      return tx.didIssuanceRequest.updateMany({
        where: {
          id: { in: expiredRequests.map((req) => req.id) },
        },
        data: {
          status: statuses.failed,
          errorMessage: "Request expired or exceeded retry limit",
        },
      });
    });
  }
}

export async function markExpiredVCRequests(
  issuer: PrismaClientIssuer,
  statuses: {
    pending: VcIssuanceStatus;
    processing: VcIssuanceStatus;
    failed: VcIssuanceStatus;
  },
  maxAgeDays?: number,
) {
  const maxAge = maxAgeDays ?? 7;
  const cutoffDate = new Date(Date.now() - maxAge * 24 * 60 * 60 * 1000);

  const expiredRequests = await issuer.internal(async (tx) => {
    return tx.vcIssuanceRequest.findMany({
      where: {
        OR: [
          // パターン1: PROCESSING状態で processedAt から指定日数経過
          {
            status: statuses.processing,
            processedAt: { lt: cutoffDate, not: null },
          },
          // パターン2: PENDING状態で requestedAt から指定日数経過
          {
            status: statuses.pending,
            requestedAt: { lt: cutoffDate },
          },
          // パターン3: リトライ回数超過
          {
            status: { in: [statuses.pending, statuses.processing] },
            retryCount: { gte: 5 },
          },
        ],
      },
    });
  });

  if (expiredRequests.length > 0) {
    logger.warn(
      `Marking ${expiredRequests.length} VC requests as failed (expired or retry limit exceeded)`,
    );

    // 詳細ログ
    expiredRequests.forEach((req) => {
      logger.debug(`Expiring VC request`, {
        requestId: req.id,
        jobId: req.jobId,
        processedAt: req.processedAt,
        requestedAt: req.requestedAt,
        retryCount: req.retryCount,
      });
    });

    await issuer.internal(async (tx) => {
      return tx.vcIssuanceRequest.updateMany({
        where: {
          id: { in: expiredRequests.map((req) => req.id) },
        },
        data: {
          status: statuses.failed,
          errorMessage: "Request expired or exceeded retry limit",
        },
      });
    });
  }
}
