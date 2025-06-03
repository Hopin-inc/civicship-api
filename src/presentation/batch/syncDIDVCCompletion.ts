import logger from "@/infrastructure/logging";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { DidIssuanceStatus, VcIssuanceStatus } from "@prisma/client";


export async function syncDIDVCCompletion() {
  logger.info("Starting DID/VC completion synchronization batch process");

  const issuer = container.resolve<PrismaClientIssuer>("prismaClientIssuer");
  const client = container.resolve<DIDVCServerClient>("DIDVCServerClient");

  try {
    await processDIDRequests(issuer, client);
    
    await processVCRequests(issuer, client);

    logger.info("DID/VC completion synchronization batch process completed");
  } catch (error) {
    logger.error("Error in DID/VC completion synchronization batch process:", error);
  }
}

async function processDIDRequests(issuer: PrismaClientIssuer, client: DIDVCServerClient) {
  
  const processingRequests = await issuer.internal(async (tx) => {
    return tx.didIssuanceRequest.findMany({
      where: {
        status: DidIssuanceStatus.PROCESSING,
        jobId: { not: null },
        retryCount: { lt: 3 }
      },
      include: {
        user: {
          include: {
            identities: {
              where: { platform: 'PHONE' }
            }
          }
        }
      }
    });
  });

  logger.info(`Found ${processingRequests.length} processing DID issuance requests`);

  for (const request of processingRequests) {
    try {
      const phoneIdentity = request.user.identities[0];
      if (!phoneIdentity) {
        throw new Error(`No phone identity found for user ${request.userId}`);
      }

      const jobStatus = await client.call<{
        status: string;
        result?: { did: string };
      }>(phoneIdentity.uid, phoneIdentity.authToken || '', `/did/jobs/${request.jobId}`, "GET");

      if (jobStatus?.status === 'completed' && jobStatus.result?.did) {
        await issuer.internal(async (tx) => {
          return tx.didIssuanceRequest.update({
            where: { id: request.id },
            data: {
              status: DidIssuanceStatus.COMPLETED,
              didValue: jobStatus.result!.did,
              completedAt: new Date()
            }
          });
        });
        logger.info(`DID issuance completed for request ${request.id}`);
      } else if (jobStatus?.status === 'failed') {
        await issuer.internal(async (tx) => {
          return tx.didIssuanceRequest.update({
            where: { id: request.id },
            data: {
              status: DidIssuanceStatus.FAILED,
              errorMessage: 'DID issuance failed on server'
            }
          });
        });
        logger.error(`DID issuance failed for request ${request.id}`);
      } else {
        await issuer.internal(async (tx) => {
          return tx.didIssuanceRequest.update({
            where: { id: request.id },
            data: { retryCount: { increment: 1 } }
          });
        });
      }
    } catch (error) {
      logger.error(`Error processing DID request ${request.id}:`, error);
      await issuer.internal(async (tx) => {
        return tx.didIssuanceRequest.update({
          where: { id: request.id },
          data: {
            retryCount: { increment: 1 },
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      });
    }
  }

  await markFailedRequests(issuer, 'didIssuanceRequest', DidIssuanceStatus.FAILED);
}

async function processVCRequests(issuer: PrismaClientIssuer, client: DIDVCServerClient) {
  const processingRequests = await issuer.internal(async (tx) => {
    return tx.vcIssuanceRequest.findMany({
      where: {
        status: VcIssuanceStatus.PROCESSING,
        jobId: { not: null },
        retryCount: { lt: 3 }
      },
      include: {
        user: {
          include: {
            identities: {
              where: { platform: 'PHONE' }
            }
          }
        }
      }
    });
  });

  logger.info(`Found ${processingRequests.length} processing VC issuance requests`);

  for (const request of processingRequests) {
    try {
      const phoneIdentity = request.user.identities[0];
      if (!phoneIdentity) {
        throw new Error(`No phone identity found for user ${request.userId}`);
      }

      const jobStatus = await client.call<{
        status: string;
        result?: { recordId: string };
      }>(phoneIdentity.uid, phoneIdentity.authToken || '', `/vc/jobs/connectionless/${request.jobId}`, "GET");

      if (jobStatus?.status === 'completed' && jobStatus.result?.recordId) {
        await issuer.internal(async (tx) => {
          return tx.vcIssuanceRequest.update({
            where: { id: request.id },
            data: {
              status: VcIssuanceStatus.COMPLETED,
              vcRecordId: jobStatus.result!.recordId,
              completedAt: new Date()
            }
          });
        });
        logger.info(`VC issuance completed for request ${request.id}`);
      } else if (jobStatus?.status === 'failed') {
        await issuer.internal(async (tx) => {
          return tx.vcIssuanceRequest.update({
            where: { id: request.id },
            data: {
              status: VcIssuanceStatus.FAILED,
              errorMessage: 'VC issuance failed on server'
            }
          });
        });
        logger.error(`VC issuance failed for request ${request.id}`);
      } else {
        await issuer.internal(async (tx) => {
          return tx.vcIssuanceRequest.update({
            where: { id: request.id },
            data: { retryCount: { increment: 1 } }
          });
        });
      }
    } catch (error) {
      logger.error(`Error processing VC request ${request.id}:`, error);
      await issuer.internal(async (tx) => {
        return tx.vcIssuanceRequest.update({
          where: { id: request.id },
          data: {
            retryCount: { increment: 1 },
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      });
    }
  }

  await markFailedRequests(issuer, 'vcIssuanceRequest', VcIssuanceStatus.FAILED);
}

async function markFailedRequests(issuer: PrismaClientIssuer, table: string, failedStatus: any) {
  const failedRequests = await issuer.internal(async (tx) => {
    return (tx as any)[table].findMany({
      where: {
        status: table === 'didIssuanceRequest' ? DidIssuanceStatus.PROCESSING : VcIssuanceStatus.PROCESSING,
        retryCount: { gte: 3 }
      }
    });
  });

  if (failedRequests.length > 0) {
    logger.warn(`Marking ${failedRequests.length} ${table} requests as failed after retry limit`);
    await issuer.internal(async (tx) => {
      return (tx as any)[table].updateMany({
        where: {
          id: { in: failedRequests.map((req: any) => req.id) }
        },
        data: {
          status: failedStatus,
          errorMessage: 'Exceeded retry limit'
        }
      });
    });
  }
}
