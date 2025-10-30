import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { DidIssuanceStatus, VcIssuanceStatus } from "@prisma/client";
import logger from "@/infrastructure/logging";

type StatusSet<T> = {
  pending: T;
  processing: T;
  failed: T;
};

export async function markExpiredRequests<T extends DidIssuanceStatus | VcIssuanceStatus>(
  issuer: PrismaClientIssuer,
  table: string,
  statuses: StatusSet<T>,
  maxAgeDays?: number,
) {
  const maxAge = maxAgeDays ?? 7;
  const cutoffDate = new Date(Date.now() - maxAge * 24 * 60 * 60 * 1000);

  const expiredRequests = await issuer.internal(async (tx) => {
    return tx[table].findMany({
      where: {
        OR: [
          // パターン1: PROCESSING状態で processedAt から7日経過
          {
            status: statuses.processing,
            processedAt: { lt: cutoffDate, not: null },
          },
          // パターン2: PENDING状態で requestedAt から7日経過
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
      `Marking ${expiredRequests.length} ${table} requests as failed (expired or retry limit exceeded)`,
    );

    // 詳細ログ
    expiredRequests.forEach((req) => {
      logger.info(
        `Expiring request ${req.id}: jobId=${req.jobId}, ` +
          `processedAt=${req.processedAt}, requestedAt=${req.requestedAt}, ` +
          `retryCount=${req.retryCount}`,
      );
    });

    await issuer.internal(async (tx) => {
      return tx[table].updateMany({
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
