import {
  GqlTransactionDonateSelfPointInput,
  GqlTransactionGrantCommunityPointInput,
  GqlTransactionIssueCommunityPointInput,
} from "@/types/graphql";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture, TransactionReason, WalletType } from "@prisma/client";
import transactionResolver from "@/application/domain/transaction/controller/resolver";

describe("Transaction Integration Tests", () => {
  const ISSUE_POINTS = 100;
  const DONATION_POINTS = 100;
  const GRANT_POINTS = 50;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  const createUserWithWallet = async (role: WalletType, communityId: string) => {
    const user = await TestDataSourceHelper.createUser({
      name: "John Doe",
      slug: `user-${Math.random().toString(36).substring(2, 8)}`,
      image: undefined,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const wallet = await TestDataSourceHelper.createWallet({
      type: role,
      community: { connect: { id: communityId } },
      user: { connect: { id: user.id } },
    });
    return { user, wallet };
  };

  const createUserAndContext = async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "John Doe",
      slug: `user-${Math.random().toString(36).substring(2, 8)}`,
      image: undefined,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const ctx = { currentUser: { id: user.id } } as unknown as IContext;
    return { user, ctx };
  };

  const createCommunity = async () => {
    return await TestDataSourceHelper.createCommunity({
      name: "community-1",
      pointName: "community-1-point",
    });
  };

  it("should issue community points", async () => {
    const { ctx } = await createUserAndContext();
    const community = await createCommunity();

    const wallet = await TestDataSourceHelper.createWallet({
      type: WalletType.COMMUNITY,
      community: { connect: { id: community.id } },
    });

    const input: GqlTransactionIssueCommunityPointInput = {
      transferPoints: ISSUE_POINTS,
      toWalletId: wallet.id,
    };

    await transactionResolver.Mutation.transactionIssueCommunityPoint(
      {},
      { input, permission: { communityId: community.id } },
      ctx,
    );
    await TestDataSourceHelper.refreshCurrentPoints();

    const [transaction] = await TestDataSourceHelper.findAllTransactions();

    expect(transaction.reason).toBe(TransactionReason.POINT_ISSUED);
    expect(transaction.to).toBe(wallet.id);
    expect(transaction.toPointChange).toBe(ISSUE_POINTS);
  });

  it("should not donate self points when balance is insufficient", async () => {
    const { user, ctx } = await createUserAndContext();
    const community = await createCommunity();

    const wallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: community.id } },
      user: { connect: { id: user.id } },
    });

    const input: GqlTransactionDonateSelfPointInput = {
      communityId: community.id,
      fromWalletId: wallet.id,
      transferPoints: DONATION_POINTS,
      toUserId: user.id,
    };

    const expectedError = `Insufficient balance: current balance 0 is less than requested amount ${DONATION_POINTS}`;
    await expect(
      transactionResolver.Mutation.transactionDonateSelfPoint(
        {},
        { input, permission: { communityId: community.id } },
        ctx,
      ),
    ).rejects.toThrow(expectedError);

    const transactions = await TestDataSourceHelper.findAllTransactions();
    expect(transactions).toHaveLength(0);
  });

  it("should donate self points when balance is sufficient", async () => {
    const community = await createCommunity();
    const { user: fromUser, wallet: fromWallet } = await createUserWithWallet(
      WalletType.MEMBER,
      community.id,
    );
    const { user: toUser, wallet: toWallet } = await createUserWithWallet(
      WalletType.MEMBER,
      community.id,
    );
    const ctx = { currentUser: { id: fromUser.id } } as unknown as IContext;

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: fromWallet.id } },
      fromPointChange: DONATION_POINTS,
      toPointChange: DONATION_POINTS,
      reason: TransactionReason.GRANT,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const input: GqlTransactionDonateSelfPointInput = {
      communityId: community.id,
      fromWalletId: fromWallet.id,
      transferPoints: DONATION_POINTS,
      toUserId: toUser.id,
    };

    await transactionResolver.Mutation.transactionDonateSelfPoint(
      {},
      { input, permission: { communityId: community.id } },
      ctx,
    );

    const transaction = (await TestDataSourceHelper.findAllTransactions()).find(
      (t) => t.reason === TransactionReason.DONATION,
    );

    expect(transaction).toBeDefined();
    expect(transaction?.from).toBe(fromWallet.id);
    expect(transaction?.to).toBe(toWallet.id);
    expect(transaction?.fromPointChange).toBe(DONATION_POINTS);
    expect(transaction?.toPointChange).toBe(DONATION_POINTS);
  });

  it("should grant community points to a user", async () => {
    const { user, ctx } = await createUserAndContext();
    const community = await createCommunity();

    const communityWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.COMMUNITY,
      community: { connect: { id: community.id } },
    });

    const memberWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: community.id } },
      user: { connect: { id: user.id } },
    });

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: communityWallet.id } },
      fromPointChange: GRANT_POINTS,
      toPointChange: GRANT_POINTS,
      reason: TransactionReason.POINT_ISSUED,
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const input: GqlTransactionGrantCommunityPointInput = {
      fromWalletId: communityWallet.id,
      transferPoints: GRANT_POINTS,
      communityId: community.id,
      toUserId: user.id,
    };

    await transactionResolver.Mutation.transactionGrantCommunityPoint(
      {},
      { input, permission: { communityId: community.id } },
      ctx,
    );

    const transaction = (await TestDataSourceHelper.findAllTransactions()).find(
      (t) => t.reason === TransactionReason.GRANT,
    );

    expect(transaction).toBeDefined();
    expect(transaction?.reason).toBe(TransactionReason.GRANT);
    expect(transaction?.to).toBe(memberWallet.id);
    expect(transaction?.toPointChange).toBe(GRANT_POINTS);
  });

  it("should not grant community points when balance is insufficient", async () => {
    const { user, ctx } = await createUserAndContext();
    const community = await createCommunity();

    const wallet = await TestDataSourceHelper.createWallet({
      type: WalletType.COMMUNITY,
      community: { connect: { id: community.id } },
    });

    const input: GqlTransactionGrantCommunityPointInput = {
      fromWalletId: wallet.id,
      transferPoints: GRANT_POINTS * 2,
      communityId: community.id,
      toUserId: user.id,
    };

    const errorExpected = `Insufficient balance: current balance 0 is less than requested amount ${GRANT_POINTS * 2}`;
    await expect(
      transactionResolver.Mutation.transactionGrantCommunityPoint(
        {},
        { input, permission: { communityId: community.id } },
        ctx,
      ),
    ).rejects.toThrow(errorExpected);

    const transactions = await TestDataSourceHelper.findAllTransactions();
    expect(transactions).toHaveLength(0);
  });
});
