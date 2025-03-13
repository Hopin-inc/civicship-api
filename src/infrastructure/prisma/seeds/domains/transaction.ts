// import { Prisma, TransactionReason } from "@prisma/client";
// import { faker } from "@faker-js/faker";
// import { processInBatches } from "./utilis";
// import { refreshMaterializedViewCurrentPoints } from "@prisma/client/sql";
//
// export async function seedTransactions(
//   tx: Prisma.TransactionClient, // トランザクションクライアントを受け取る
//   communityIds: string[], // 全てのコミュニティID
//   communityWalletIds: Record<string, string>, // コミュニティごとのウォレットID
//   memberWalletIds: Record<string, string[]>, // コミュニティごとのメンバーウォレットID
//   communityUtilityMap: Record<string, string[]>, // コミュニティごとのユーティリティID
//   approvedParticipationIds: Record<string, string[]>, // コミュニティごとの承認済み参加ID
// ): Promise<void> {
//   console.log("Seeding Transactions...");
//
//   for (const communityId of communityIds) {
//     const communityWalletId = communityWalletIds[communityId];
//     const memberWallets = memberWalletIds[communityId] || [];
//     const utilityIds = communityUtilityMap[communityId] || [];
//     const participationIds = approvedParticipationIds[communityId] || [];
//
//     if (!communityWalletId || memberWallets.length === 0) {
//       console.warn(`Skipping community ID: ${communityId} due to insufficient data.`);
//       continue; // データ不足の場合はスキップ
//     }
//
//     const transactionTasks = Array.from({ length: 10 }, () => {
//       const transactionType = faker.helpers.arrayElement([
//         "issueCommunityPoint",
//         "grantCommunityPoint",
//         "donateSelfPoint",
//         "giveRewardPoint",
//         "useUtility",
//       ]);
//
//       switch (transactionType) {
//         case "issueCommunityPoint": {
//           return {
//             reason: TransactionReason.POINT_ISSUED,
//             toWallet: { connect: { id: communityWalletId } },
//             toPointChange: faker.number.int({ min: 10, max: 1000 }),
//           };
//         }
//
//         case "grantCommunityPoint": {
//           if (memberWallets.length === 0) return null; // 空チェック
//           const toWallet = faker.helpers.arrayElement(memberWallets);
//           const points = faker.number.int({ min: 10, max: 50 });
//
//           return {
//             reason: TransactionReason.GRANT,
//             fromWallet: { connect: { id: communityWalletId } },
//             fromPointChange: -points,
//             toWallet: { connect: { id: toWallet } },
//             toPointChange: points,
//           };
//         }
//
//         case "donateSelfPoint": {
//           if (memberWallets.length <= 1) return null; // 空チェック
//           const fromWallet = faker.helpers.arrayElement(memberWallets);
//           const toWallet = faker.helpers.arrayElement(
//             memberWallets.filter((id) => id !== fromWallet),
//           );
//           const points = faker.number.int({ min: 10, max: 50 });
//
//           return {
//             reason: TransactionReason.DONATION,
//             fromWallet: { connect: { id: fromWallet } },
//             fromPointChange: -points,
//             toWallet: { connect: { id: toWallet } },
//             toPointChange: points,
//           };
//         }
//
//         case "giveRewardPoint": {
//           if (memberWallets.length === 0 || participationIds.length === 0) return null; // 空チェック
//           const toWallet = faker.helpers.arrayElement(memberWallets);
//           const participationId = faker.helpers.arrayElement(participationIds);
//           const points = faker.number.int({ min: 10, max: 50 });
//
//           return {
//             reason: TransactionReason.POINT_REWARD,
//             fromWallet: { connect: { id: communityWalletId } },
//             fromPointChange: -points,
//             toWallet: { connect: { id: toWallet } },
//             toPointChange: points,
//             participation: { connect: { id: participationId } },
//           };
//         }
//
//         case "useUtility": {
//           if (memberWallets.length === 0 || utilityIds.length === 0) return null; // 空チェック
//           const fromWallet = faker.helpers.arrayElement(memberWallets);
//           const utilityId = faker.helpers.arrayElement(utilityIds);
//           const points = faker.number.int({ min: 10, max: 50 });
//
//           return {
//             reason: TransactionReason.UTILITY_REDEEMED,
//             fromWallet: { connect: { id: fromWallet } },
//             fromPointChange: -points,
//             toWallet: { connect: { id: communityWalletId } },
//             toPointChange: points,
//             utility: { connect: { id: utilityId } },
//           };
//         }
//       }
//     }).filter(Boolean) as Prisma.TransactionUncheckedCreateInput[]; // 型アサーションで明示的に型を指定
//
//     // トランザクションクライアントでバッチ処理
//     if (transactionTasks.length === 0) {
//       console.warn(`No transactions to seed for community ID: ${communityId}`);
//       continue;
//     }
//
//     await processInBatches(transactionTasks, 3, async (batch) => {
//       await Promise.all(
//         batch.map(async (data) => {
//           await tx.transaction.create({ data });
//         }),
//       );
//     });
//
//     console.log(`Transactions for community ID: ${communityId} seeded!`);
//   }
//
//   console.log("Refreshing materialized view for current points...");
//   await tx.$queryRawTyped(refreshMaterializedViewCurrentPoints());
//   console.log("Materialized view refreshed successfully!");
// }
