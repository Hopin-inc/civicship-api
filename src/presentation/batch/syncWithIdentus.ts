import logger from "@/infrastructure/logging";
import { container } from 'tsyringe';
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import IdentityService from "@/application/domain/account/identity/service";
import { DIDIssuanceStatus } from "@/application/domain/account/identity/data/didIssuanceRequest/enum";

export async function syncWithIdentus() {
  logger.info("Starting DID/VC synchronization batch process");
  
  const issuer = container.resolve<PrismaClientIssuer>("prismaClientIssuer");
  const identityService = container.resolve(IdentityService);
  
  try {
    const pendingRequests = await issuer.internal(async (tx) => {
      return tx.dIDIssuanceRequest.findMany({
        where: {
          status: DIDIssuanceStatus.PENDING,
          retryCount: { lt: 3 }
        },
        include: {
          user: {
            include: {
              identities: {
                where: {
                  platform: 'PHONE'
                }
              }
            }
          }
        }
      });
    });
    
    logger.info(`Found ${pendingRequests.length} pending DID issuance requests`);
    
    for (const request of pendingRequests) {
      try {
        await issuer.internal(async (tx) => {
          return tx.dIDIssuanceRequest.update({
            where: { id: request.id },
            data: {
              status: DIDIssuanceStatus.PROCESSING,
              processedAt: new Date(),
              retryCount: { increment: 1 }
            }
          });
        });
        
        const phoneIdentity = request.user.identities[0];
        if (!phoneIdentity) {
          throw new Error(`No phone identity found for user ${request.userId}`);
        }
        
        const didStatus = await identityService.callDIDVCServer(
          phoneIdentity.uid,
          `/did/jobs/${request.id}`,
          'GET'
        );
        
        if (didStatus?.status === 'completed' && didStatus?.didValue) {
          await issuer.internal(async (tx) => {
            return tx.dIDIssuanceRequest.update({
              where: { id: request.id },
              data: {
                status: DIDIssuanceStatus.COMPLETED,
                didValue: didStatus.didValue,
                completedAt: new Date()
              }
            });
          });
          logger.info(`DID issuance completed for request ${request.id}`);
        } else if (didStatus?.status === 'failed') {
          await issuer.internal(async (tx) => {
            return tx.dIDIssuanceRequest.update({
              where: { id: request.id },
              data: {
                status: DIDIssuanceStatus.FAILED,
                errorMessage: didStatus.errorMessage || 'DID issuance failed on server'
              }
            });
          });
          logger.error(`DID issuance failed for request ${request.id}: ${didStatus.errorMessage}`);
        } else {
          await issuer.internal(async (tx) => {
            return tx.dIDIssuanceRequest.update({
              where: { id: request.id },
              data: {
                status: DIDIssuanceStatus.PENDING
              }
            });
          });
          logger.info(`DID issuance still in progress for request ${request.id}`);
        }
      } catch (error) {
        logger.error(`Error processing DID request ${request.id}:`, error);
        
        await issuer.internal(async (tx) => {
          return tx.dIDIssuanceRequest.update({
            where: { id: request.id },
            data: {
              status: DIDIssuanceStatus.PENDING,
              errorMessage: error instanceof Error ? error.message : 'Unknown error'
            }
          });
        });
      }
    }
    
    const failedRequests = await issuer.internal(async (tx) => {
      return tx.dIDIssuanceRequest.findMany({
        where: {
          status: DIDIssuanceStatus.PENDING,
          retryCount: { gte: 3 }
        }
      });
    });
    
    if (failedRequests.length > 0) {
      logger.warn(`Marking ${failedRequests.length} DID requests as failed after retry limit`);
      
      await issuer.internal(async (tx) => {
        return tx.dIDIssuanceRequest.updateMany({
          where: {
            id: {
              in: failedRequests.map(req => req.id)
            }
          },
          data: {
            status: DIDIssuanceStatus.FAILED,
            errorMessage: 'Exceeded retry limit'
          }
        });
      });
    }
    
    logger.info("DID/VC synchronization batch process completed");
  } catch (error) {
    logger.error("Error in DID/VC synchronization batch process:", error);
  }
}
