// import transactionResolver from "@/presentation/graphql/resolvers/transaction";
// import { GqlCommunityCreateInput, GqlTransactionDonateSelfPointInput, GqlTransactionGrantCommunityPointInput, GqlTransactionIssueCommunityPointInput } from "@/types/graphql";
// import TestDataSourceHelper from "../../helper/test-data-source-helper";
// import { IContext } from "@/types/server";
// import { TransactionReason, WalletType } from "@prisma/client";
//
// describe("Transaction Integration Tests", () => {
//     beforeEach(async () => {
//         // clean up data before each test
//         await TestDataSourceHelper.deleteAll();
//         TestDataSourceHelper.disconnect();
//     });
//
//     afterAll(async () => {
//         // close DB transaction after each test
//         TestDataSourceHelper.disconnect();
//     });
//
//     it("should issue community points", async () => {
//         //////////////////////////////////////////////////
//         // insert seed data
//         //////////////////////////////////////////////////
//         const name = "John Doe"
//         const slug = "user-1-slug"
//         const createUserInput = {
//             name: name,
//             slug: slug,
//             image: undefined
//         }
//         const userInserted = await TestDataSourceHelper.create(createUserInput);
//         const userId = userInserted.id;
//
//         const ctx = { uid: userId } as unknown as IContext;
//
//         const communityName = "community-1";
//         const pointName = "community-1-point";
//
//         const createCommunityInput: GqlCommunityCreateInput = {
//             name: communityName,
//             pointName: pointName,
//             image: undefined,
//             bio: undefined,
//             establishedAt: undefined,
//             website: undefined
//         };
//         const communityInserted = await TestDataSourceHelper.createCommunity(createCommunityInput);
//         const communityId = communityInserted.id;
//
//
//         const createWalletInput =
//         {
//             type: WalletType.COMMUNITY,
//             community: { connect: { id: communityId } },
//         };
//         const walletInserted = await TestDataSourceHelper.createWallet(createWalletInput);
//         const walletId = walletInserted.id;
//
//
//         //////////////////////////////////////////////////
//         // construct request
//         //////////////////////////////////////////////////
//         const issuedPoint = 100;
//         const input: GqlTransactionIssueCommunityPointInput = {
//             toPointChange: issuedPoint,
//             toWalletId: walletId
//         };
//
//         //////////////////////////////////////////////////
//         // execute
//         //////////////////////////////////////////////////
//         await transactionResolver.Mutation.transactionIssueCommunityPoint(
//             {},
//             { input: input },
//             ctx
//         );
//
//         //////////////////////////////////////////////////
//         // assert result
//         //////////////////////////////////////////////////
//         const transactions = await TestDataSourceHelper.findAllTransactions();
//         const transactionActual = transactions[0];
//
//         // トランザクションが1件だけ作成されていること
//         expect(transactions.length).toEqual(1);
//         // ポイント発行のレコードが作成されていること
//         expect(transactionActual.reason).toEqual(TransactionReason.POINT_ISSUED);
//         // 期待通りのwalletに移動していること
//         expect(transactionActual.to).toEqual(walletId);
//         // 期待通りのポイント数が移動していること
//         expect(transactionActual.toPointChange).toEqual(issuedPoint);
//         // // mv_current_pointsの値が期待通りにrefreshされていること
//         // const currentPointActual = (await TestDataSourceHelper.findCommunityWallet(communityId))?.currentPointView?.currentPoint;
//         // const initialPoint = 0;
//         // const currentPointExpected = initialPoint + issuedPoint;
//         // expect(currentPointActual).toEqual(currentPointExpected);
//     });
//
//     it("should not donate self points when balance is insufficient", async () => {
//         //////////////////////////////////////////////////
//         // insert seed data
//         //////////////////////////////////////////////////
//         const name = "John Doe"
//         const slug = "user-1-slug"
//         const createUserInput = {
//             name: name,
//             slug: slug,
//             image: undefined
//         }
//         const userInserted = await TestDataSourceHelper.create(createUserInput);
//         const userId = userInserted.id;
//
//         const ctx = { uid: userId } as unknown as IContext;
//
//         const communityName = "community-1";
//         const pointName = "community-1-point";
//
//         const createCommunityInput: GqlCommunityCreateInput = {
//             name: communityName,
//             pointName: pointName,
//             image: undefined,
//             bio: undefined,
//             establishedAt: undefined,
//             website: undefined
//         };
//         const communityInserted = await TestDataSourceHelper.createCommunity(createCommunityInput);
//         const communityId = communityInserted.id;
//
//
//         const createCommunityWalletInput =
//         {
//             type: WalletType.COMMUNITY,
//             community: { connect: { id: communityId } },
//         };
//         await TestDataSourceHelper.createWallet(createCommunityWalletInput);
//
//         const createMemberWalletInput =
//         {
//             type: WalletType.MEMBER,
//             community: { connect: { id: communityId } },
//             user: { connect: { id: userId } }
//         };
//         const memberWalletInserted = await TestDataSourceHelper.createWallet(createMemberWalletInput);
//         const memberWalletId = memberWalletInserted.id;
//
//         //////////////////////////////////////////////////
//         // construct request
//         //////////////////////////////////////////////////
//         const donatedPoints = 100;
//         const input: GqlTransactionDonateSelfPointInput = {
//             communityId: communityId,
//             fromWalletId: memberWalletId,
//             fromPointChange: donatedPoints,
//             toPointChange: donatedPoints,
//             toUserId: userId
//         };
//
//         //////////////////////////////////////////////////
//         // execute & assert result
//         //////////////////////////////////////////////////
//
//         // errorをthrowすること
//         const errorExpected = `Insufficient points in community wallet. Required: ${donatedPoints}, Available: 0`;
//         await expect(transactionResolver.Mutation.transactionDonateSelfPoint(
//             {},
//             { input: input },
//             ctx
//         )).rejects.toThrow(errorExpected);
//
//         // transactionが作成されていないこと
//         const transactions = await TestDataSourceHelper.findAllTransactions();
//         expect(transactions.length).toEqual(0);
//
//         // mv_current_pointsがそもそも作成されていない
//     });
//
//     it("should donate self points when balance is sufficient", async () => {
//         //////////////////////////////////////////////////
//         // insert seed data
//         //////////////////////////////////////////////////
//         const name = "John Doe"
//         const slug = "user-1-slug"
//         const createUserInput = {
//             name: name,
//             slug: slug,
//             image: undefined
//         }
//         const fromUserInserted = await TestDataSourceHelper.create(createUserInput);
//         const fromUserId = fromUserInserted.id;
//
//         const toUserInserted = await TestDataSourceHelper.create(createUserInput);
//         const toUserId = toUserInserted.id;
//
//         const ctx = { uid: fromUserId } as unknown as IContext;
//
//         const communityName = "community-1";
//         const pointName = "community-1-point";
//
//         const createCommunityInput: GqlCommunityCreateInput = {
//             name: communityName,
//             pointName: pointName,
//             image: undefined,
//             bio: undefined,
//             establishedAt: undefined,
//             website: undefined
//         };
//         const communityInserted = await TestDataSourceHelper.createCommunity(createCommunityInput);
//         const communityId = communityInserted.id;
//
//         const createFromMemberWalletInput =
//         {
//             type: WalletType.MEMBER,
//             community: { connect: { id: communityId } },
//             user: { connect: { id: fromUserId } }
//         };
//         const fromMemberWalletInserted = await TestDataSourceHelper.createWallet(createFromMemberWalletInput);
//         const fromMemberWalletId = fromMemberWalletInserted.id;
//
//         const createToMemberWalletInput =
//         {
//             type: WalletType.MEMBER,
//             community: { connect: { id: communityId } },
//             user: { connect: { id: toUserId } }
//         };
//         const toMemberWalletInserted = await TestDataSourceHelper.createWallet(createToMemberWalletInput);
//         const toMemberWalletId = toMemberWalletInserted.id;
//
//         const createTransactionInput = { to: fromMemberWalletId, toPointChange: 100, reason: TransactionReason.GRANT };
//         await TestDataSourceHelper.createTransaction(createTransactionInput);
//
//         await TestDataSourceHelper.refreshCurrentPoints()
//
//         //////////////////////////////////////////////////
//         // construct request
//         //////////////////////////////////////////////////
//         const donatedPoints = 100;
//         const input: GqlTransactionDonateSelfPointInput = {
//             communityId: communityId,
//             fromWalletId: fromMemberWalletId,
//             toUserId: toUserId,
//             fromPointChange: donatedPoints,
//             toPointChange: donatedPoints,
//         };
//
//         //////////////////////////////////////////////////
//         // execute
//         //////////////////////////////////////////////////
//
//         await transactionResolver.Mutation.transactionDonateSelfPoint(
//             {},
//             { input: input },
//             ctx
//         );
//
//         //////////////////////////////////////////////////
//         // execute
//         //////////////////////////////////////////////////
//
//         const transactions = await TestDataSourceHelper.findAllTransactions();
//         const transactionActual = transactions.find(t => t.reason === TransactionReason.DONATION);
//
//         // reasonがDONATIONのトランザクションが1件だけ作成されていること
//         expect(transactionActual).toBeDefined();
//
//         // 期待通りのwalletから移動していること
//         expect(transactionActual?.from).toEqual(fromMemberWalletId);
//         // 期待通りのwalletに移動していること
//         expect(transactionActual?.to).toEqual(toMemberWalletId);
//         // 期待通りのポイント数が移動していること
//         expect(transactionActual?.fromPointChange).toEqual(donatedPoints);
//         expect(transactionActual?.toPointChange).toEqual(donatedPoints);
//         // // mv_current_pointsの値が期待通りにrefreshされていること
//         // const toMemberCurrentPointActual = (await TestDataSourceHelper.findMemberWallet(toUserId))?.currentPointView?.currentPoint;
//         // const memberInitialPoint = 0;
//         // const toMemberCurrentPointExpected = memberInitialPoint + donatedPoints;
//         // expect(toMemberCurrentPointActual).toEqual(toMemberCurrentPointExpected);
//     });
//
//     it("should grant community points to a user", async () => {
//         //////////////////////////////////////////////////
//         // insert seed data
//         //////////////////////////////////////////////////
//         const name = "John Doe"
//         const slug = "user-1-slug"
//         const createUserInput = {
//             name: name,
//             slug: slug,
//             image: undefined
//         }
//         const userInserted = await TestDataSourceHelper.create(createUserInput);
//         const userId = userInserted.id;
//
//         const ctx = { uid: userId } as unknown as IContext;
//
//         const communityName = "community-1";
//         const pointName = "community-1-point";
//
//         const createCommunityInput = {
//             name: communityName,
//             pointName: pointName,
//             image: undefined,
//             bio: undefined,
//             establishedAt: undefined,
//             website: undefined
//         };
//         const communityInserted = await TestDataSourceHelper.createCommunity(createCommunityInput);
//         const communityId = communityInserted.id;
//
//         const createCommunityWalletInput = {
//             type: WalletType.COMMUNITY,
//             community: { connect: { id: communityId } },
//         };
//         const communityWalletInserted = await TestDataSourceHelper.createWallet(createCommunityWalletInput);
//         const communityWalletId = communityWalletInserted.id;
//
//         const createMemberWalletInput =
//         {
//             type: WalletType.MEMBER,
//             community: { connect: { id: communityId } },
//             user: { connect: { id: userId } }
//         };
//         const memberWalletInserted = await TestDataSourceHelper.createWallet(createMemberWalletInput);
//         const memberWalletId = memberWalletInserted.id;
//
//         const initialPoint = 50
//         const createTransactionInput = { to: communityWalletId, toPointChange: initialPoint, reason: TransactionReason.POINT_ISSUED };
//         await TestDataSourceHelper.createTransaction(createTransactionInput);
//
//         await TestDataSourceHelper.refreshCurrentPoints()
//
//         //////////////////////////////////////////////////
//         // construct request
//         //////////////////////////////////////////////////
//         const grantedPoint = 50;
//         const input: GqlTransactionGrantCommunityPointInput = {
//             fromWalletId: communityWalletId,
//             fromPointChange: grantedPoint,
//             toPointChange: grantedPoint,
//             communityId: communityId,
//             toUserId: userId
//         };
//
//         //////////////////////////////////////////////////
//         // execute
//         //////////////////////////////////////////////////
//         await transactionResolver.Mutation.transactionGrantCommunityPoint(
//             {},
//             { input: input },
//             ctx
//         );
//
//         //////////////////////////////////////////////////
//         // assert result
//         //////////////////////////////////////////////////
//         const transactions = await TestDataSourceHelper.findAllTransactions();
//         const transactionActual = transactions.find(t => t.reason === TransactionReason.GRANT);
//
//         // reasonがGRANTのトランザクションが1件だけ作成されていること
//         expect(transactionActual).toBeDefined();
//         // ポイント付与のレコードが作成されていること
//         expect(transactionActual?.reason).toEqual(TransactionReason.GRANT);
//         // 期待通りのwalletに移動していること
//         expect(transactionActual?.to).toEqual(memberWalletId);
//         // 期待通りのポイント数が移動していること
//         expect(transactionActual?.toPointChange).toEqual(grantedPoint);
//         // // mv_current_pointsの値が期待通りにrefreshされていること
//         // const currentPointActual = (await TestDataSourceHelper.findCommunityWallet(communityId))?.currentPointView?.currentPoint;
//         // const currentPointExpected = initialPoint - grantedPoint;
//         // expect(currentPointActual).toEqual(currentPointExpected);
//     });
//
//     it("should not grant community points when balance is insufficient", async () => {
//         //////////////////////////////////////////////////
//         // insert seed data
//         //////////////////////////////////////////////////
//         const name = "John Doe"
//         const slug = "user-1-slug"
//         const createUserInput = {
//             name: name,
//             slug: slug,
//             image: undefined
//         }
//         const userInserted = await TestDataSourceHelper.create(createUserInput);
//         const userId = userInserted.id;
//
//         const ctx = { uid: userId } as unknown as IContext;
//
//         const communityName = "community-1";
//         const pointName = "community-1-point";
//
//         const createCommunityInput = {
//             name: communityName,
//             pointName: pointName,
//             image: undefined,
//             bio: undefined,
//             establishedAt: undefined,
//             website: undefined
//         };
//         const communityInserted = await TestDataSourceHelper.createCommunity(createCommunityInput);
//         const communityId = communityInserted.id;
//
//         const createWalletInput = {
//             type: WalletType.COMMUNITY,
//             community: { connect: { id: communityId } },
//         };
//         await TestDataSourceHelper.createWallet(createWalletInput);
//         const walletInserted = await TestDataSourceHelper.createWallet(createWalletInput);
//         const walletId = walletInserted.id;
//
//
//         //////////////////////////////////////////////////
//         // construct request
//         //////////////////////////////////////////////////
//         const grantedPoint = 100;
//         const input: GqlTransactionGrantCommunityPointInput = {
//             fromWalletId: walletId,
//             fromPointChange: grantedPoint,
//             toPointChange: grantedPoint,
//             communityId: communityId,
//             toUserId: userId
//         };
//
//         //////////////////////////////////////////////////
//         // execute & assert result
//         //////////////////////////////////////////////////
//         // errorをthrowすること
//         const errorExpected = `Insufficient points in community wallet. Required: ${grantedPoint}, Available: 0`;
//         await expect(transactionResolver.Mutation.transactionDonateSelfPoint(
//             {},
//             { input: input },
//             ctx
//         )).rejects.toThrow(errorExpected);
//
//         // transactionが作成されていないこと
//         const transactions = await TestDataSourceHelper.findAllTransactions();
//         expect(transactions.length).toEqual(0);
//
//         // mv_current_pointsがそもそも作成されていない
//     });
// });
