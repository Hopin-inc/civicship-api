// import { PrismaClient } from "@prisma/client";
// import logger from "@/infrastructure/logging";
// import IdentityService from "@/application/domain/account/identity/service";
// import { container } from "tsyringe";
//
// const prisma = new PrismaClient();
// const identityService = container.resolve(IdentityService);
//
// export async function syncDIDVC() {
//   logger.info("Starting DID/VC synchronization batch process");
//
//   try {
//     const pendingRequests = await prisma.didIssuanceRequest.findMany({
//       where: {
//         status: "PENDING",
//         retryCount: { lt: 3 }, // Limit retries
//       },
//       include: {
//         user: {
//           include: {
//             identities: {
//               where: {
//                 platform: "PHONE",
//               },
//             },
//           },
//         },
//       },
//     });
//
//     logger.info(`Found ${pendingRequests.length} pending DID issuance requests`);
//
//     for (const request of pendingRequests) {
//       try {
//         await prisma.didIssuanceRequest.update({
//           where: { id: request.id },
//           data: {
//             status: "PROCESSING",
//             processedAt: new Date(),
//             retryCount: { increment: 1 },
//           },
//         });
//
//         const phoneIdentity = request.user.identities[0];
//         if (!phoneIdentity) {
//           throw new Error(`No phone identity found for user ${request.userId}`);
//         }
//
//         const didStatus = await identityService.callDIDVCServer(
//           phoneIdentity.uid,
//           `/did/jobs/${request.id}`,
//           "GET",
//         );
//
//         if (didStatus?.status === "completed" && didStatus?.didValue) {
//           await prisma.didIssuanceRequest.update({
//             where: { id: request.id },
//             data: {
//               status: "COMPLETED",
//               didValue: didStatus.didValue,
//               completedAt: new Date(),
//             },
//           });
//           logger.info(`DID issuance completed for request ${request.id}`);
//         } else if (didStatus?.status === "failed") {
//           await prisma.didIssuanceRequest.update({
//             where: { id: request.id },
//             data: {
//               status: "FAILED",
//               errorMessage: didStatus.errorMessage || "DID issuance failed on server",
//             },
//           });
//           logger.error(`DID issuance failed for request ${request.id}: ${didStatus.errorMessage}`);
//         } else {
//           await prisma.didIssuanceRequest.update({
//             where: { id: request.id },
//             data: {
//               status: "PENDING",
//             },
//           });
//           logger.info(`DID issuance still in progress for request ${request.id}`);
//         }
//       } catch (error) {
//         logger.error(`Error processing DID request ${request.id}:`, error);
//
//         await prisma.didIssuanceRequest.update({
//           where: { id: request.id },
//           data: {
//             status: "PENDING", // Revert to pending for retry
//             errorMessage: error instanceof Error ? error.message : "Unknown error",
//           },
//         });
//       }
//     }
//
//     const failedRequests = await prisma.didIssuanceRequest.findMany({
//       where: {
//         status: "PENDING",
//         retryCount: { gte: 3 },
//       },
//     });
//
//     if (failedRequests.length > 0) {
//       logger.warn(`Marking ${failedRequests.length} DID requests as failed after retry limit`);
//
//       await prisma.didIssuanceRequest.updateMany({
//         where: {
//           id: {
//             in: failedRequests.map((req) => req.id),
//           },
//         },
//         data: {
//           status: "FAILED",
//           errorMessage: "Exceeded retry limit",
//         },
//       });
//     }
//
//     logger.info("DID/VC synchronization batch process completed");
//   } catch (error) {
//     logger.error("Error in DID/VC synchronization batch process:", error);
//   }
// }
