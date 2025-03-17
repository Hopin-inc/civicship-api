import transactionResolver from "@/presentation/graphql/resolvers/transaction";
import { GqlCommunityCreateInput, GqlTransactionDonateSelfPointInput, GqlTransactionGrantCommunityPointInput } from "@/types/graphql";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { TransactionReason, WalletType } from "@prisma/client";

describe("Transaction Integration Tests", () => {
    beforeEach(async () => {
        // clean up data before each test
        await TestDataSourceHelper.deleteAll();
        TestDataSourceHelper.disconnect();
    });

    afterAll(async () => {
        // close DB transaction after each test
        TestDataSourceHelper.disconnect();
    });


    it("should create member wallet if not exists when donate self points", async () => {
        //////////////////////////////////////////////////
        // insert seed data
        //////////////////////////////////////////////////
        const name = "John Doe"
        const slug = "user-1-slug"
        const createUserInput = {
            name: name,
            slug: slug,
            image: undefined
        }
        const fromUserInserted = await TestDataSourceHelper.create(createUserInput);
        const fromUserId = fromUserInserted.id;

        const toUserInserted = await TestDataSourceHelper.create(createUserInput);
        const toUserId = toUserInserted.id;

        const ctx = { uid: fromUserId } as unknown as IContext;

        const communityName = "community-1";
        const pointName = "community-1-point";

        const createCommunityInput: GqlCommunityCreateInput = {
            name: communityName,
            pointName: pointName,
            image: undefined,
            bio: undefined,
            establishedAt: undefined,
            website: undefined
        };
        const communityInserted = await TestDataSourceHelper.createCommunity(createCommunityInput);
        const communityId = communityInserted.id;

        const createFromMemberWalletInput =
        {
            type: WalletType.MEMBER,
            community: { connect: { id: communityId } },
            user: { connect: { id: fromUserId } }
        };
        const fromMemberWalletInserted = await TestDataSourceHelper.createWallet(createFromMemberWalletInput);
        const fromMemberWalletId = fromMemberWalletInserted.id;


        const createTransactionInput = { to: fromMemberWalletId, toPointChange: 100, reason: TransactionReason.GRANT };
        await TestDataSourceHelper.createTransaction(createTransactionInput);

        await TestDataSourceHelper.refreshCurrentPoints()

        //////////////////////////////////////////////////
        // construct request
        //////////////////////////////////////////////////
        const donatedPoints = 100;
        const input: GqlTransactionDonateSelfPointInput = {
            communityId: communityId,
            fromWalletId: fromMemberWalletId,
            toUserId: toUserId,
            fromPointChange: donatedPoints,
            toPointChange: donatedPoints,
        };

        //////////////////////////////////////////////////
        // execute
        //////////////////////////////////////////////////

        await transactionResolver.Mutation.transactionDonateSelfPoint(
            {},
            { input: input },
            ctx
        );

        //////////////////////////////////////////////////
        // execute
        //////////////////////////////////////////////////

        const transactions = await TestDataSourceHelper.findAllTransactions();
        const transactionActual = transactions.find(t => t.reason === TransactionReason.DONATION);

        // toMemberWalletが生成されていること
        const toMemberWalletActual = await TestDataSourceHelper.findMemberWallet(toUserId);
        expect(toMemberWalletActual).toBeDefined;
        // 期待通りのwalletに移動していること
        expect(transactionActual?.to).toEqual(toMemberWalletActual?.id);
    });

    it("should grant community points to a user", async () => {
        //////////////////////////////////////////////////
        // insert seed data
        //////////////////////////////////////////////////
        const name = "John Doe"
        const slug = "user-1-slug"
        const createUserInput = {
            name: name,
            slug: slug,
            image: undefined
        }
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
            website: undefined
        };
        const communityInserted = await TestDataSourceHelper.createCommunity(createCommunityInput);
        const communityId = communityInserted.id;

        const createWalletInput = {
            type: WalletType.COMMUNITY,
            community: { connect: { id: communityId } },
        };
        const walletInserted = await TestDataSourceHelper.createWallet(createWalletInput);
        const walletId = walletInserted.id;

        const initialPoint = 50
        const createTransactionInput = { to: walletId, toPointChange: initialPoint, reason: TransactionReason.POINT_ISSUED };
        await TestDataSourceHelper.createTransaction(createTransactionInput);

        await TestDataSourceHelper.refreshCurrentPoints()

        //////////////////////////////////////////////////
        // construct request
        //////////////////////////////////////////////////
        const grantedPoint = 50;
        const input: GqlTransactionGrantCommunityPointInput = {
            fromWalletId: walletId,
            fromPointChange: grantedPoint,
            toPointChange: grantedPoint,
            communityId: communityId,
            toUserId: userId
        };

        //////////////////////////////////////////////////
        // execute
        //////////////////////////////////////////////////
        await transactionResolver.Mutation.transactionGrantCommunityPoint(
            {},
            { input: input },
            ctx
        );

        //////////////////////////////////////////////////
        // assert result
        //////////////////////////////////////////////////
        const transactions = await TestDataSourceHelper.findAllTransactions();
        const transactionActual = transactions.find(t => t.reason === TransactionReason.GRANT);

        // toMemberWalletが生成されていること
        const toMemberWalletActual = await TestDataSourceHelper.findMemberWallet(userId);
        expect(toMemberWalletActual).toBeDefined;
        // 期待通りのwalletに移動していること
        expect(transactionActual?.to).toEqual(toMemberWalletActual?.id);
    });
});