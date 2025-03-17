import utilityResolver from "@/presentation/graphql/resolvers/utility";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { TransactionReason, WalletType } from "@prisma/client";

describe("Utility Redeem Mutation Tests", () => {
    beforeEach(async () => {
        // clean up data before each test
        await TestDataSourceHelper.deleteAll();
        TestDataSourceHelper.disconnect();
    });

    afterAll(async () => {
        // close DB transaction after each test
        TestDataSourceHelper.disconnect();
    });

    it("should fail to redeem utility when wallet balance is insufficient", async () => {
        //////////////////////////////////////////////////
        // insert seed data
        //////////////////////////////////////////////////
        const userName = "John Doe";
        const slug = "user-1-slug";
        const createUserInput = {
            name: userName,
            slug: slug,
            image: undefined,
        };
        const userInserted = await TestDataSourceHelper.create(createUserInput);
        const userId = userInserted.id;
        const ctx = { uid: userId } as unknown as IContext;

        const communityName = "community-1";
        const pointName = "community-1-point";
        const createCommunityInput = {
            name: communityName,
            pointName: pointName,
            image: undefined,
            bio: undefined,
            establishedAt: undefined,
            website: undefined,
        };
        const communityInserted = await TestDataSourceHelper.createCommunity(createCommunityInput);
        const communityId = communityInserted.id;

        const createCommunityWalletInput =
        {
            type: WalletType.COMMUNITY,
            community: { connect: { id: communityId } },
        };
        const communityWalletInserted = await TestDataSourceHelper.createWallet(createCommunityWalletInput);
        const communityWalletId = communityWalletInserted.id;

        const createMemberWalletInput = {
            type: WalletType.MEMBER,
            community: { connect: { id: communityId } },
            user: { connect: { id: userId } },
        };
        const memberWalletInserted = await TestDataSourceHelper.createWallet(createMemberWalletInput);
        const memberWalletId = memberWalletInserted.id;

        const utilityName = 'utility-1';
        const pointsRequired = 100;
        const createUtilityInput = {
            name: utilityName,
            pointsRequired: 100,
            community: { connect: { id: communityId } }
        }
        const utilityInserted = await TestDataSourceHelper.createUtility(createUtilityInput);
        const utilityId = utilityInserted.id;

        //////////////////////////////////////////////////
        // construct request
        //////////////////////////////////////////////////

        const input = {
            fromWalletId: memberWalletId,
            toWalletId: communityWalletId,
            transferPoints: pointsRequired,
            communityId: communityId,
            userWalletId: memberWalletId
        };

        //////////////////////////////////////////////////
        // execute & assert result
        //////////////////////////////////////////////////
        // 残高不足のエラーが発生することを期待
        const errorExpected = `Insufficient points in community wallet. Required: ${pointsRequired}, Available: 0`;
        await expect(
            utilityResolver.Mutation.utilityRedeem({}, { id: utilityId, input }, ctx)
        ).rejects.toThrow(errorExpected);

        // トランザクションが作成されていないこと
        const transactions = await TestDataSourceHelper.findAllTransactions();
        expect(transactions.length).toEqual(0);
    });


    it("should redeem utility successfully when wallet balance is sufficient", async () => {
        //////////////////////////////////////////////////
        // insert seed data
        //////////////////////////////////////////////////
        const userName = "Jane Doe";
        const slug = "user-2-slug";
        const createUserInput = {
            name: userName,
            slug: slug,
            image: undefined,
        };
        const userInserted = await TestDataSourceHelper.create(createUserInput);
        const userId = userInserted.id;
        const ctx = { uid: userId } as unknown as IContext;

        const communityName = "community-2";
        const pointName = "community-2-point";
        const createCommunityInput = {
            name: communityName,
            pointName: pointName,
            image: undefined,
            bio: undefined,
            establishedAt: undefined,
            website: undefined,
        };
        const communityInserted = await TestDataSourceHelper.createCommunity(createCommunityInput);
        const communityId = communityInserted.id;

        const createCommunityWalletInput =
        {
            type: WalletType.COMMUNITY,
            community: { connect: { id: communityId } },
        };
        const communityWalletInserted = await TestDataSourceHelper.createWallet(createCommunityWalletInput);
        const communityWalletId = communityWalletInserted.id;

        const createMemberWalletInput = {
            type: WalletType.MEMBER,
            community: { connect: { id: communityId } },
            user: { connect: { id: userId } },
        };
        const memberWalletInserted = await TestDataSourceHelper.createWallet(createMemberWalletInput);
        const memberWalletId = memberWalletInserted.id;

        const utilityName = 'utility-2';
        const memberInitialPoint = 100;
        const createUtilityInput = {
            name: utilityName,
            pointsRequired: memberInitialPoint,
            community: { connect: { id: communityId } }
        }
        const utilityInserted = await TestDataSourceHelper.createUtility(createUtilityInput);
        const utilityId = utilityInserted.id;

        const createTransactionInput = { to: memberWalletId, toPointChange: 100, reason: TransactionReason.GRANT };
        await TestDataSourceHelper.createTransaction(createTransactionInput);

        await TestDataSourceHelper.refreshCurrentPoints()

        //////////////////////////////////////////////////
        // construct request
        //////////////////////////////////////////////////

        const pointsRequired = 100;
        const input = {
            fromWalletId: memberWalletId,
            toWalletId: communityWalletId,
            transferPoints: pointsRequired,
            communityId: communityId,
            userWalletId: memberWalletId
        };

        //////////////////////////////////////////////////
        // execute
        //////////////////////////////////////////////////
        const result = await utilityResolver.Mutation.utilityRedeem({}, { id: utilityId, input }, ctx);
        console.log(result)

        //////////////////////////////////////////////////
        // assert result
        //////////////////////////////////////////////////
        const transactions = await TestDataSourceHelper.findAllTransactions();
        const transactionActual = transactions.find(t => t.reason === TransactionReason.UTILITY_REDEEMED);

        // reasonがDONATIONのトランザクションが1件だけ作成されていること
        expect(transactionActual).toBeDefined;

        // 期待通りのwalletから移動していること
        expect(transactionActual?.from).toEqual(memberWalletId);
        // 期待通りのwalletに移動していること
        expect(transactionActual?.to).toEqual(communityWalletId);
        // 期待通りのポイント数が移動していること
        expect(transactionActual?.fromPointChange).toEqual(-pointsRequired);
        expect(transactionActual?.toPointChange).toEqual(pointsRequired);
        // // mv_current_pointsの値が期待通りにrefreshされていること
        // const memberCurrentPointActual = (await TestDataSourceHelper.findMemberWallet(userId))?.currentPointView?.currentPoint;
        // const memberCurrentPointExpected = memberInitialPoint + pointsRequired;
        // expect(memberCurrentPointActual).toEqual(memberCurrentPointExpected);

        // const communityInitialPoint = 0;
        // const communityCurrentPointActual = (await TestDataSourceHelper.findCommunityWallet(communityId))?.currentPointView?.currentPoint;
        // const communityCurrentPointExpected = communityInitialPoint + pointsRequired;
        // expect(communityCurrentPointActual).toEqual(communityCurrentPointExpected);

    });
});
