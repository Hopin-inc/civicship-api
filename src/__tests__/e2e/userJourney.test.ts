// import "reflect-metadata";
// import TestDataSourceHelper from "../helper/test-data-source-helper";
// import { IContext } from "@/types/server";
// import { CurrentPrefecture, TransactionReason, WalletType } from "@prisma/client";
// import IdentityUseCase from "@/application/domain/account/identity/usecase";
// import TransactionUseCase from "@/application/domain/transaction/usecase";
// import CommunityUseCase from "@/application/domain/account/community/usecase";
// import { container } from "tsyringe";
// import { registerProductionDependencies } from "@/application/provider";
// import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
// import { GqlCurrentPrefecture, GqlIdentityPlatform } from "@/types/graphql";
//
// describe("End-to-End User Journey Integration Tests", () => {
//   let identityUseCase: IdentityUseCase;
//   let transactionUseCase: TransactionUseCase;
//   let communityUseCase: CommunityUseCase;
//   let issuer: PrismaClientIssuer;
//
//   beforeEach(async () => {
//     await TestDataSourceHelper.deleteAll();
//     jest.clearAllMocks();
//     container.reset();
//     registerProductionDependencies();
//     identityUseCase = container.resolve(IdentityUseCase);
//     transactionUseCase = container.resolve(TransactionUseCase);
//     communityUseCase = container.resolve(CommunityUseCase);
//     issuer = container.resolve(PrismaClientIssuer);
//   });
//
//   afterAll(async () => {
//     await TestDataSourceHelper.disconnect();
//   });
//
//   it("should complete full user journey: signup -> receive points -> donate points", async () => {
//     const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//
//     const community = await TestDataSourceHelper.createCommunity({
//       name: `test-community-${uniqueId}`,
//       pointName: "pt",
//     });
//
//     const signupCtx: IContext = {
//       uid: `uid-${uniqueId}`,
//       platform: GqlIdentityPlatform.Line,
//       phoneAuthToken: "test-phone-auth-token",
//       communityId: community.id,
//       issuer,
//     } as IContext;
//
//     const signupResult = await identityUseCase.userCreateAccount(signupCtx, {
//       input: {
//         name: "Test User",
//         slug: `test-user-${uniqueId}`,
//         currentPrefecture: GqlCurrentPrefecture.Kagawa,
//         communityId: community.id,
//         phoneUid: `test-phone-uid-${uniqueId}`,
//       },
//     });
//
//     expect(signupResult.user).toBeDefined();
//     const userId = signupResult.user!.id;
//
//     const communityWallet = await TestDataSourceHelper.createWallet({
//       type: WalletType.COMMUNITY,
//       community: { connect: { id: community.id } },
//     });
//
//     await TestDataSourceHelper.createTransaction({
//       toWallet: { connect: { id: communityWallet.id } },
//       toPointChange: 1000,
//       fromPointChange: 1000,
//       reason: TransactionReason.POINT_ISSUED,
//     });
//
//     await TestDataSourceHelper.refreshCurrentPoints();
//
//     const grantCtx = { currentUser: { id: userId }, issuer } as IContext;
//
//     await transactionUseCase.ownerGrantCommunityPoint(grantCtx, {
//       input: { transferPoints: 500, toUserId: userId },
//       permission: { communityId: community.id },
//     });
//
//     const secondUser = await TestDataSourceHelper.createUser({
//       name: "Second User",
//       slug: `second-user-${uniqueId}`,
//       currentPrefecture: CurrentPrefecture.KAGAWA,
//     });
//
//     await transactionUseCase.userDonateSelfPointToAnother(grantCtx, {
//       input: {
//         communityId: community.id,
//         toUserId: secondUser.id,
//         transferPoints: 100,
//       },
//       permission: { userId: userId },
//     });
//
//     await TestDataSourceHelper.refreshCurrentPoints();
//
//     const userWallet = await TestDataSourceHelper.findMemberWallet(userId, community.id);
//     const secondUserWallet = await TestDataSourceHelper.findMemberWallet(
//       secondUser.id,
//       community.id,
//     );
//
//     expect(userWallet?.currentPointView?.currentPoint).toBe(BigInt(400));
//     expect(secondUserWallet?.currentPointView?.currentPoint).toBe(BigInt(100));
//
//     const transactions = await TestDataSourceHelper.findAllTransactions();
//     expect(transactions).toHaveLength(3); // Issue, Grant, Donation
//
//     const donationTx = transactions.find((t) => t.reason === TransactionReason.DONATION);
//     expect(donationTx).toBeDefined();
//     expect(donationTx?.toPointChange).toBe(100);
//   });
//
//   it("should handle community creation and multi-user interactions", async () => {
//     const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//
//     const owner = await TestDataSourceHelper.createUser({
//       name: "Community Owner",
//       slug: `owner-${uniqueId}`,
//       currentPrefecture: CurrentPrefecture.KAGAWA,
//     });
//
//     const ownerCtx = { currentUser: { id: owner.id }, issuer } as IContext;
//
//     const communityResult = await communityUseCase.userCreateCommunityAndJoin(
//       {
//         input: {
//           name: `Multi User Community ${uniqueId}`,
//           pointName: "pts",
//         },
//       },
//       ownerCtx,
//     );
//
//     expect(communityResult.community).toBeDefined();
//     const communityId = communityResult.community!.id;
//
//     await transactionUseCase.ownerIssueCommunityPoint(
//       {
//         input: { transferPoints: 2000 },
//         permission: { communityId },
//       },
//       ownerCtx,
//     );
//
//     const users: any[] = [];
//     for (let i = 0; i < 3; i++) {
//       const user = await TestDataSourceHelper.createUser({
//         name: `User ${i + 1}`,
//         slug: `user-${i + 1}-${uniqueId}`,
//         currentPrefecture: CurrentPrefecture.KAGAWA,
//       });
//       users.push(user);
//
//       await transactionUseCase.ownerGrantCommunityPoint(ownerCtx, {
//         input: { transferPoints: 300, toUserId: user.id },
//         permission: { communityId },
//       });
//     }
//
//     const user1Ctx = { currentUser: { id: users[0].id }, issuer } as IContext;
//     await transactionUseCase.userDonateSelfPointToAnother(user1Ctx, {
//       input: {
//         communityId,
//         toUserId: users[1].id,
//         transferPoints: 50,
//       },
//       permission: { userId: users[0].id },
//     });
//
//     const user2Ctx = { currentUser: { id: users[1].id }, issuer } as IContext;
//     await transactionUseCase.userDonateSelfPointToAnother(user2Ctx, {
//       input: {
//         communityId,
//         toUserId: users[2].id,
//         transferPoints: 75,
//       },
//       permission: { userId: users[1].id },
//     });
//
//     await TestDataSourceHelper.refreshCurrentPoints();
//
//     const user1Wallet = await TestDataSourceHelper.findMemberWallet(users[0].id, communityId);
//     const user2Wallet = await TestDataSourceHelper.findMemberWallet(users[1].id, communityId);
//     const user3Wallet = await TestDataSourceHelper.findMemberWallet(users[2].id, communityId);
//
//     expect(user1Wallet?.currentPointView?.currentPoint).toBe(BigInt(250)); // 300 - 50
//     expect(user2Wallet?.currentPointView?.currentPoint).toBe(BigInt(275)); // 300 + 50 - 75
//     expect(user3Wallet?.currentPointView?.currentPoint).toBe(BigInt(375)); // 300 + 75
//
//     const allTransactions = await TestDataSourceHelper.findAllTransactions();
//     const totalIssued = allTransactions
//       .filter((t) => t.reason === TransactionReason.POINT_ISSUED)
//       .reduce((sum, t) => sum + Number(t.toPointChange), 0);
//
//     expect(totalIssued).toBe(2000);
//   });
// });
