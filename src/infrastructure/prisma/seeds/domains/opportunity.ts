// import { Prisma, OpportunityCategory, ParticipationStatus, PublishStatus } from "@prisma/client";
// import { faker } from "@faker-js/faker";
// import { processInBatches } from "@/infrastructure/prisma/seeds/domains/utilis";
//
// type ParticipationWithoutOpportunity = Omit<Prisma.ParticipationCreateInput, "opportunity">;
//
// type OpportunityTask = {
//   opportunityData: Prisma.OpportunityCreateInput;
//   participationTasks: ParticipationWithoutOpportunity[];
// };
//
// export async function seedOpportunities(
//   tx: Prisma.TransactionClient,
//   communityIds: string[],
//   userIds: string[],
//   cityData: { code: string; stateCode: string; countryCode: string }[],
//   communityUserMap: Record<string, string[]>,
// ): Promise<Record<string, string[]>> {
//   console.log("Seeding Opportunities with Participations...");
//
//   if (communityIds.length === 0 || userIds.length === 0 || cityData.length === 0) {
//     throw new Error("Community IDs, User IDs, or City Data cannot be empty.");
//   }
//
//   const approvedParticipationIds: Record<string, string[]> = {};
//
//   const opportunityTasks: OpportunityTask[] = Array.from({ length: 20 }, () => {
//     const communityId = faker.helpers.arrayElement(communityIds);
//     const userId = faker.helpers.arrayElement(userIds);
//     const randomCity = faker.helpers.arrayElement(cityData);
//
//     if (!communityId || !userId || !randomCity) {
//       console.warn("Skipping opportunity due to missing data.");
//       return null;
//     }
//
//     const participationTasks = Array.from(
//       { length: faker.number.int({ min: 1, max: 5 }) },
//       (): ParticipationWithoutOpportunity | null => {
//         const participantUserId = faker.helpers.arrayElement(communityUserMap[communityId]);
//
//         if (!participantUserId) {
//           console.warn(
//             `Skipping participation due to missing participants for communityId: ${communityId}`,
//           );
//           return null;
//         }
//
//         const participationId = faker.string.uuid();
//         const status = faker.helpers.arrayElement(Object.values(ParticipationStatus));
//
//         if (status === ParticipationStatus.APPROVED) {
//           if (!approvedParticipationIds[communityId]) {
//             approvedParticipationIds[communityId] = [];
//           }
//           approvedParticipationIds[communityId].push(participationId);
//         }
//
//         return {
//           id: participationId,
//           status,
//           user: { connect: { id: participantUserId } },
//           community: { connect: { id: communityId } },
//         };
//       },
//     ).filter(Boolean) as ParticipationWithoutOpportunity[];
//
//     return {
//       opportunityData: {
//         id: faker.string.uuid(),
//         title: faker.company.catchPhrase(),
//         description: faker.lorem.paragraph(),
//         category: faker.helpers.arrayElement(Object.values(OpportunityCategory)),
//         publishStatus: faker.helpers.arrayElement(Object.values(PublishStatus)),
//         pointsPerParticipation: faker.number.int({ min: 10, max: 100 }),
//         startsAt: faker.date.future(),
//         endsAt: faker.date.future(),
//         community: { connect: { id: communityId } },
//         city: { connect: { code: randomCity.code } },
//         createdByUser: { connect: { id: userId } },
//       },
//       participationTasks,
//     };
//   }).filter(Boolean) as OpportunityTask[];
//
//   await processInBatches(opportunityTasks, 3, async (batch) => {
//     await Promise.all(
//       batch.map(async (task) => {
//         const createdOpportunity = await tx.opportunity.create({
//           data: task.opportunityData,
//         });
//
//         await Promise.all(
//           task.participationTasks.map((data) =>
//             tx.participation.create({
//               data: {
//                 ...data,
//                 opportunity: { connect: { id: createdOpportunity.id } },
//               },
//             }),
//           ),
//         );
//       }),
//     );
//   });
//
//   console.log("Opportunities and Participations seeded!");
//   return approvedParticipationIds;
// }
