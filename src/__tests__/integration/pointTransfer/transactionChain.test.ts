import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { CurrentPrefecture, TransactionReason, WalletType } from "@prisma/client";

describe("Transaction Chain Tests", () => {
  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  describe("refreshTransactionChains", () => {
    it("should refresh without error when no transactions exist", async () => {
      await expect(TestDataSourceHelper.refreshTransactionChains()).resolves.not.toThrow();
    });

    it("should track GRANT transaction as chain root with depth 1", async () => {
      // Setup: Community and User
      const user = await TestDataSourceHelper.createUser({
        name: "User A",
        slug: "user-a",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const community = await TestDataSourceHelper.createCommunity({
        name: "Test Community",
        pointName: "point",
      });

      const communityWallet = await TestDataSourceHelper.createWallet({
        type: WalletType.COMMUNITY,
        community: { connect: { id: community.id } },
      });

      const userWallet = await TestDataSourceHelper.createWallet({
        type: WalletType.MEMBER,
        community: { connect: { id: community.id } },
        user: { connect: { id: user.id } },
      });

      // Create GRANT transaction
      const grantTx = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: communityWallet.id } },
        toWallet: { connect: { id: userWallet.id } },
        fromPointChange: -100,
        toPointChange: 100,
        reason: TransactionReason.GRANT,
      });

      // Refresh materialized view
      await TestDataSourceHelper.refreshTransactionChains();

      // Verify chain info
      const chainInfo = await TestDataSourceHelper.getTransactionChain(grantTx.id);

      expect(chainInfo).not.toBeNull();
      expect(chainInfo?.depth).toBe(1);
      expect(chainInfo?.rootTxId).toBe(grantTx.id);
      expect(chainInfo?.chainTxIds).toEqual([grantTx.id]);
    });

    it("should track GRANT -> DONATION chain with correct depth", async () => {
      // Setup: Community and two Users
      const userA = await TestDataSourceHelper.createUser({
        name: "User A",
        slug: "user-a",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const userB = await TestDataSourceHelper.createUser({
        name: "User B",
        slug: "user-b",
        currentPrefecture: CurrentPrefecture.TOKUSHIMA,
      });

      const community = await TestDataSourceHelper.createCommunity({
        name: "Test Community",
        pointName: "point",
      });

      const communityWallet = await TestDataSourceHelper.createWallet({
        type: WalletType.COMMUNITY,
        community: { connect: { id: community.id } },
      });

      const userAWallet = await TestDataSourceHelper.createWallet({
        type: WalletType.MEMBER,
        community: { connect: { id: community.id } },
        user: { connect: { id: userA.id } },
      });

      const userBWallet = await TestDataSourceHelper.createWallet({
        type: WalletType.MEMBER,
        community: { connect: { id: community.id } },
        user: { connect: { id: userB.id } },
      });

      // Create GRANT transaction: Community -> UserA
      const grantTx = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: communityWallet.id } },
        toWallet: { connect: { id: userAWallet.id } },
        fromPointChange: -100,
        toPointChange: 100,
        reason: TransactionReason.GRANT,
      });

      // Wait a bit to ensure different created_at timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Create DONATION transaction: UserA -> UserB
      const donationTx = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: userAWallet.id } },
        toWallet: { connect: { id: userBWallet.id } },
        fromPointChange: -50,
        toPointChange: 50,
        reason: TransactionReason.DONATION,
      });

      // Refresh materialized view
      await TestDataSourceHelper.refreshTransactionChains();

      // Verify GRANT chain info
      const grantChainInfo = await TestDataSourceHelper.getTransactionChain(grantTx.id);
      expect(grantChainInfo).not.toBeNull();
      expect(grantChainInfo?.depth).toBe(1);
      expect(grantChainInfo?.rootTxId).toBe(grantTx.id);

      // Verify DONATION chain info (should be linked to GRANT)
      const donationChainInfo = await TestDataSourceHelper.getTransactionChain(donationTx.id);
      expect(donationChainInfo).not.toBeNull();
      expect(donationChainInfo?.depth).toBe(2);
      expect(donationChainInfo?.rootTxId).toBe(grantTx.id);
      expect(donationChainInfo?.chainTxIds).toEqual([grantTx.id, donationTx.id]);
    });

    it("should track multiple independent chains separately", async () => {
      // Setup
      const user1 = await TestDataSourceHelper.createUser({
        name: "User 1",
        slug: "user-1",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const user2 = await TestDataSourceHelper.createUser({
        name: "User 2",
        slug: "user-2",
        currentPrefecture: CurrentPrefecture.TOKUSHIMA,
      });

      const community = await TestDataSourceHelper.createCommunity({
        name: "Test Community",
        pointName: "point",
      });

      const communityWallet = await TestDataSourceHelper.createWallet({
        type: WalletType.COMMUNITY,
        community: { connect: { id: community.id } },
      });

      const user1Wallet = await TestDataSourceHelper.createWallet({
        type: WalletType.MEMBER,
        community: { connect: { id: community.id } },
        user: { connect: { id: user1.id } },
      });

      const user2Wallet = await TestDataSourceHelper.createWallet({
        type: WalletType.MEMBER,
        community: { connect: { id: community.id } },
        user: { connect: { id: user2.id } },
      });

      // Create two independent GRANT transactions
      const grant1 = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: communityWallet.id } },
        toWallet: { connect: { id: user1Wallet.id } },
        fromPointChange: -100,
        toPointChange: 100,
        reason: TransactionReason.GRANT,
      });

      const grant2 = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: communityWallet.id } },
        toWallet: { connect: { id: user2Wallet.id } },
        fromPointChange: -200,
        toPointChange: 200,
        reason: TransactionReason.GRANT,
      });

      // Refresh materialized view
      await TestDataSourceHelper.refreshTransactionChains();

      // Verify each GRANT has its own chain
      const chain1 = await TestDataSourceHelper.getTransactionChain(grant1.id);
      const chain2 = await TestDataSourceHelper.getTransactionChain(grant2.id);

      expect(chain1?.rootTxId).toBe(grant1.id);
      expect(chain2?.rootTxId).toBe(grant2.id);

      // Each chain is independent
      expect(chain1?.rootTxId).not.toBe(chain2?.rootTxId);
    });
  });
});
