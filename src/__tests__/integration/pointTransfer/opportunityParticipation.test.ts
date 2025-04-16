// import TestDataSourceHelper from "../../helper/test-data-source-helper";
// import { IContext } from "@/types/server";
// import {
//   OpportunityCategory,
//   ParticipationStatus, Prisma,
//   PublishStatus,
//   TransactionReason,
//   WalletType,
// } from "@prisma/client";
//
// describe("Point Reward Tests", () => {
//   beforeEach(async () => {
//     // clean up data before each test
//     await TestDataSourceHelper.deleteAll();
//     TestDataSourceHelper.disconnect();
//   });
//
//   afterAll(async () => {
//     // close DB transaction after each test
//     TestDataSourceHelper.disconnect();
//   });
//
//   it("should giver reward successfully", async () => {
//     //////////////////////////////////////////////////
//     // insert seed data
//     //////////////////////////////////////////////////
//     const userName = "Jane Doe";
//     const slug = "user-2-slug";
//     const createUserInput = {
//       name: userName,
//       slug: slug,
//       image: undefined,
//     };
//     const userInserted = await TestDataSourceHelper.createUser(createUserInput);
//     const userId = userInserted.id;
//     const ctx = { currentUser: { id: userId } } as unknown as IContext;
//
//     const communityName = "community-2";
//     const pointName = "community-2-point";
//     const createCommunityInput = {
//       name: communityName,
//       pointName: pointName,
//       image: undefined,
//       bio: undefined,
//       establishedAt: undefined,
//       website: undefined,
//     };
//     const communityInserted = await TestDataSourceHelper.createCommunity(createCommunityInput);
//     const communityId = communityInserted.id;
//
//     const createCommunityWalletInput = {
//       type: WalletType.COMMUNITY,
//       community: { connect: { id: communityId } },
//     };
//     const communityWalletInserted = await TestDataSourceHelper.createWallet(
//       createCommunityWalletInput,
//     );
//     const communityWalletId = communityWalletInserted.id;
//
//     const createMemberWalletInput = {
//       type: WalletType.MEMBER,
//       community: { connect: { id: communityId } },
//       user: { connect: { id: userId } },
//     };
//     const memberWalletInserted = await TestDataSourceHelper.createWallet(createMemberWalletInput);
//     const memberWalletId = memberWalletInserted.id;
//
//     const pointsToEarn = 100;
//     const createOpportunityInput = {
//       category: OpportunityCategory.QUEST,
//       description: "opportunity",
//       publishStatus: PublishStatus.PUBLIC,
//       requireApproval: true,
//       title: "opportunity",
//       pointsToEarn: pointsToEarn,
//       community: { connect: { id: communityId } },
//       createdByUser: { connect: { id: userId } },
//     };
//     const opportunityInserted =
//       await TestDataSourceHelper.createOpportunity(createOpportunityInput);
//     const opportunityId = opportunityInserted.id;
//
//     const createParticipationInput = {
//       status: ParticipationStatus.PENDING,
//       community: { connect: { id: communityId } },
//       user: { connect: { id: userId } },
//       opportunity: { connect: { id: opportunityId } },
//     };
//     const participationInserted =
//       await TestDataSourceHelper.createParticipation(createParticipationInput);
//     const participationId = participationInserted.id;
//
//     const communityInitialPoint = 101;
//     const createTransactionInput = {
//       to: communityWalletId,
//       toPointChange: communityInitialPoint,
//       reason: TransactionReason.POINT_ISSUED,
//     };
//     await TestDataSourceHelper.createTransaction(createTransactionInput);
//
//     await TestDataSourceHelper.refreshCurrentPoints();
//
//     //////////////////////////////////////////////////
//     // construct request
//     //////////////////////////////////////////////////
//
//     const input: Prisma.ParticipationUpdateInput = {
//       communityId: communityId,
//     };
//
//     //////////////////////////////////////////////////
//     // execute
//     //////////////////////////////////////////////////
//     await participationResolver.Mutation.participationApprovePerformance(
//       {},
//       { id: participationId, input },
//       ctx,
//     );
//
//     //////////////////////////////////////////////////
//     // assert result
//     //////////////////////////////////////////////////
//     const transactions = await TestDataSourceHelper.findAllTransactions();
//     const transactionActual = transactions.find((t) => t.reason === TransactionReason.POINT_REWARD);
//
//     // reasonがPOINT_REWARDのトランザクションが1件だけ作成されていること
//     expect(transactionActual).toBeDefined;
//
//     // 期待通りのwalletから移動していること
//     expect(transactionActual?.from).toEqual(communityWalletId);
//     // 期待通りのwalletに移動していること
//     expect(transactionActual?.to).toEqual(memberWalletId);
//     // 期待通りのポイント数が移動していること
//     expect(transactionActual?.fromPointChange).toEqual(-pointsToEarn);
//     expect(transactionActual?.toPointChange).toEqual(pointsToEarn);
//
//     // mv_current_pointsの値が期待通りにrefreshされていること
//     const memberCurrentPointActual = (await TestDataSourceHelper.findMemberWallet(userId))
//       ?.currentPointView?.currentPoint;
//     const memberCurrentPointExpected = pointsToEarn;
//     expect(memberCurrentPointActual).toEqual(memberCurrentPointExpected);
//
//     // const communityCurrentPointActual = (await TestDataSourceHelper.findCommunityWallet(communityId))?.currentPointView?.currentPoint;
//     // const communityCurrentPointExpected = communityInitialPoint - pointsToEarn;
//     // expect(communityCurrentPointActual).toEqual(communityCurrentPointExpected);
//   });
// });
