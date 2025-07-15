import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { DidIssuanceStatus, VcIssuanceStatus } from "@prisma/client";
import logger from "@/infrastructure/logging";

export async function markFailedRequests(
  issuer: PrismaClientIssuer,
  table: string,
  failedStatus: DidIssuanceStatus | VcIssuanceStatus,
) {
  const failedRequests = await issuer.internal(async (tx) => {
    return tx[table].findMany({
      where: {
        status:
          table === "didIssuanceRequest"
            ? DidIssuanceStatus.PROCESSING
            : VcIssuanceStatus.PROCESSING,
        retryCount: { gte: 3 },
      },
    });
  });

  if (failedRequests.length > 0) {
    logger.warn(`Marking ${failedRequests.length} ${table} requests as failed after retry limit`);
    await issuer.internal(async (tx) => {
      return tx[table].updateMany({
        where: {
          id: { in: failedRequests.map((req) => req.id) },
        },
        data: {
          status: failedStatus,
          errorMessage: "Exceeded retry limit",
        },
      });
    });
  }
}
