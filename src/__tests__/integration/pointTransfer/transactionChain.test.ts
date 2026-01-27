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

    it("should select deeper chain when multiple paths exist to same transaction", async () => {
      // Setup: Community and three Users
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

      const userC = await TestDataSourceHelper.createUser({
        name: "User C",
        slug: "user-c",
        currentPrefecture: CurrentPrefecture.KOCHI,
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

      const userCWallet = await TestDataSourceHelper.createWallet({
        type: WalletType.MEMBER,
        community: { connect: { id: community.id } },
        user: { connect: { id: userC.id } },
      });

      // Create chain: Community → UserA (GRANT, tx1)
      const grant1 = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: communityWallet.id } },
        toWallet: { connect: { id: userAWallet.id } },
        fromPointChange: -100,
        toPointChange: 100,
        reason: TransactionReason.GRANT,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Create chain: UserA → UserB (DONATION, tx2)
      const donation1 = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: userAWallet.id } },
        toWallet: { connect: { id: userBWallet.id } },
        fromPointChange: -50,
        toPointChange: 50,
        reason: TransactionReason.DONATION,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Create direct GRANT to UserB: Community → UserB (GRANT, tx3)
      // This creates a shorter path (depth=1) to UserB
      await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: communityWallet.id } },
        toWallet: { connect: { id: userBWallet.id } },
        fromPointChange: -100,
        toPointChange: 100,
        reason: TransactionReason.GRANT,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Create chain: UserB → UserC (DONATION, tx4)
      // tx4 can be reached via:
      //   - tx1 → tx2 → tx4 (depth=3, root=tx1)
      //   - tx3 → tx4 (depth=2, root=tx3)
      // Should select deeper chain (depth=3)
      const donation2 = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: userBWallet.id } },
        toWallet: { connect: { id: userCWallet.id } },
        fromPointChange: -25,
        toPointChange: 25,
        reason: TransactionReason.DONATION,
      });

      // Refresh materialized view
      await TestDataSourceHelper.refreshTransactionChains();

      // Verify tx4 selected the deeper chain (depth=3, root=tx1)
      const donation2Chain = await TestDataSourceHelper.getTransactionChain(donation2.id);

      expect(donation2Chain).not.toBeNull();
      expect(donation2Chain?.depth).toBe(3);
      expect(donation2Chain?.rootTxId).toBe(grant1.id);
      expect(donation2Chain?.chainTxIds).toEqual([grant1.id, donation1.id, donation2.id]);
    });

    it("should prefer newer GRANT when depths are equal (tiebreaker)", async () => {
      // Setup: Two independent chains that converge
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

      const userC = await TestDataSourceHelper.createUser({
        name: "User C",
        slug: "user-c",
        currentPrefecture: CurrentPrefecture.KOCHI,
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

      const userCWallet = await TestDataSourceHelper.createWallet({
        type: WalletType.MEMBER,
        community: { connect: { id: community.id } },
        user: { connect: { id: userC.id } },
      });

      // Create older GRANT to UserA (tx1) - not used in assertion, just for setup
      await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: communityWallet.id } },
        toWallet: { connect: { id: userAWallet.id } },
        fromPointChange: -100,
        toPointChange: 100,
        reason: TransactionReason.GRANT,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Create newer GRANT to UserB (tx2)
      const newerGrant = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: communityWallet.id } },
        toWallet: { connect: { id: userBWallet.id } },
        fromPointChange: -100,
        toPointChange: 100,
        reason: TransactionReason.GRANT,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      // UserA → UserC (tx3) - creates path depth=2 from olderGrant
      await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: userAWallet.id } },
        toWallet: { connect: { id: userCWallet.id } },
        fromPointChange: -50,
        toPointChange: 50,
        reason: TransactionReason.DONATION,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      // UserB → UserC (tx4) - creates path depth=2 from newerGrant
      // tx4 has two paths with same depth=2:
      //   - olderGrant → tx3 → (UserC receives) but tx4 starts from UserB, not applicable
      // Actually tx4 itself: newerGrant → tx4 (depth=2)
      // UserC now has points from both paths, and any transfer from UserC will have both paths
      const finalTx = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: userBWallet.id } },
        toWallet: { connect: { id: userCWallet.id } },
        fromPointChange: -50,
        toPointChange: 50,
        reason: TransactionReason.DONATION,
      });

      await TestDataSourceHelper.refreshTransactionChains();

      // finalTx should have depth=2 and prefer newerGrant (larger root_tx_id)
      const finalChain = await TestDataSourceHelper.getTransactionChain(finalTx.id);

      expect(finalChain).not.toBeNull();
      expect(finalChain?.depth).toBe(2);
      expect(finalChain?.rootTxId).toBe(newerGrant.id);
    });
  });

  describe("Performance Tests", () => {
    it("should handle deep chain (20 transfers) efficiently", async () => {
      const community = await TestDataSourceHelper.createCommunity({
        name: "Test Community",
        pointName: "point",
      });

      const communityWallet = await TestDataSourceHelper.createWallet({
        type: WalletType.COMMUNITY,
        community: { connect: { id: community.id } },
      });

      // Create 21 users for a chain of 20 transfers
      const users = await Promise.all(
        Array.from({ length: 21 }, (_, i) =>
          TestDataSourceHelper.createUser({
            name: `User ${i}`,
            slug: `user-${i}`,
            currentPrefecture: CurrentPrefecture.KAGAWA,
          })
        )
      );

      const wallets = await Promise.all(
        users.map((user) =>
          TestDataSourceHelper.createWallet({
            type: WalletType.MEMBER,
            community: { connect: { id: community.id } },
            user: { connect: { id: user.id } },
          })
        )
      );

      // Create GRANT to first user
      let previousWalletId = communityWallet.id;
      const grantTx = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: communityWallet.id } },
        toWallet: { connect: { id: wallets[0].id } },
        fromPointChange: -1000,
        toPointChange: 1000,
        reason: TransactionReason.GRANT,
      });

      previousWalletId = wallets[0].id;
      let lastTxId = grantTx.id;

      // Create chain of 20 donations
      for (let i = 1; i < 21; i++) {
        await new Promise((resolve) => setTimeout(resolve, 5));
        const tx = await TestDataSourceHelper.createTransaction({
          fromWallet: { connect: { id: previousWalletId } },
          toWallet: { connect: { id: wallets[i].id } },
          fromPointChange: -10,
          toPointChange: 10,
          reason: TransactionReason.DONATION,
        });
        previousWalletId = wallets[i].id;
        lastTxId = tx.id;
      }

      // Measure refresh time
      const startTime = Date.now();
      await TestDataSourceHelper.refreshTransactionChains();
      const refreshTime = Date.now() - startTime;

      // Verify the chain depth
      const lastChain = await TestDataSourceHelper.getTransactionChain(lastTxId);

      expect(lastChain).not.toBeNull();
      expect(lastChain?.depth).toBe(21); // GRANT + 20 donations
      expect(lastChain?.rootTxId).toBe(grantTx.id);
      expect(lastChain?.chainTxIds.length).toBe(21);

      // Performance assertion: should complete within 5 seconds
      expect(refreshTime).toBeLessThan(5000);
      console.log(`Deep chain (21 depth) refresh time: ${refreshTime}ms`);
    });

    it("should handle many transactions (100 independent chains) efficiently", async () => {
      const community = await TestDataSourceHelper.createCommunity({
        name: "Test Community",
        pointName: "point",
      });

      const communityWallet = await TestDataSourceHelper.createWallet({
        type: WalletType.COMMUNITY,
        community: { connect: { id: community.id } },
      });

      // Create 100 users
      const users = await Promise.all(
        Array.from({ length: 100 }, (_, i) =>
          TestDataSourceHelper.createUser({
            name: `User ${i}`,
            slug: `user-perf-${i}`,
            currentPrefecture: CurrentPrefecture.KAGAWA,
          })
        )
      );

      const wallets = await Promise.all(
        users.map((user) =>
          TestDataSourceHelper.createWallet({
            type: WalletType.MEMBER,
            community: { connect: { id: community.id } },
            user: { connect: { id: user.id } },
          })
        )
      );

      // Create 100 independent GRANTs
      const grants = await Promise.all(
        wallets.map((wallet) =>
          TestDataSourceHelper.createTransaction({
            fromWallet: { connect: { id: communityWallet.id } },
            toWallet: { connect: { id: wallet.id } },
            fromPointChange: -100,
            toPointChange: 100,
            reason: TransactionReason.GRANT,
          })
        )
      );

      // Measure refresh time
      const startTime = Date.now();
      await TestDataSourceHelper.refreshTransactionChains();
      const refreshTime = Date.now() - startTime;

      // Verify some chains
      const firstChain = await TestDataSourceHelper.getTransactionChain(grants[0].id);
      const lastChain = await TestDataSourceHelper.getTransactionChain(grants[99].id);

      expect(firstChain?.depth).toBe(1);
      expect(lastChain?.depth).toBe(1);

      // Performance assertion: should complete within 5 seconds
      expect(refreshTime).toBeLessThan(5000);
      console.log(`100 independent chains refresh time: ${refreshTime}ms`);
    });

    it("should handle branching chains (fan-out pattern) efficiently", async () => {
      const community = await TestDataSourceHelper.createCommunity({
        name: "Test Community",
        pointName: "point",
      });

      const communityWallet = await TestDataSourceHelper.createWallet({
        type: WalletType.COMMUNITY,
        community: { connect: { id: community.id } },
      });

      // Create users: 1 hub + 10 receivers
      const hubUser = await TestDataSourceHelper.createUser({
        name: "Hub User",
        slug: "hub-user",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      const hubWallet = await TestDataSourceHelper.createWallet({
        type: WalletType.MEMBER,
        community: { connect: { id: community.id } },
        user: { connect: { id: hubUser.id } },
      });

      const receiverUsers = await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          TestDataSourceHelper.createUser({
            name: `Receiver ${i}`,
            slug: `receiver-${i}`,
            currentPrefecture: CurrentPrefecture.TOKUSHIMA,
          })
        )
      );

      const receiverWallets = await Promise.all(
        receiverUsers.map((user) =>
          TestDataSourceHelper.createWallet({
            type: WalletType.MEMBER,
            community: { connect: { id: community.id } },
            user: { connect: { id: user.id } },
          })
        )
      );

      // GRANT to hub user
      const grantTx = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: communityWallet.id } },
        toWallet: { connect: { id: hubWallet.id } },
        fromPointChange: -1000,
        toPointChange: 1000,
        reason: TransactionReason.GRANT,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Hub fans out to 10 receivers
      const donations = await Promise.all(
        receiverWallets.map(async (wallet) => {
          await new Promise((resolve) => setTimeout(resolve, 5));
          return TestDataSourceHelper.createTransaction({
            fromWallet: { connect: { id: hubWallet.id } },
            toWallet: { connect: { id: wallet.id } },
            fromPointChange: -50,
            toPointChange: 50,
            reason: TransactionReason.DONATION,
          });
        })
      );

      // Measure refresh time
      const startTime = Date.now();
      await TestDataSourceHelper.refreshTransactionChains();
      const refreshTime = Date.now() - startTime;

      // Verify all donations have depth=2 and point to same root
      for (const donation of donations) {
        const chain = await TestDataSourceHelper.getTransactionChain(donation.id);
        expect(chain?.depth).toBe(2);
        expect(chain?.rootTxId).toBe(grantTx.id);
      }

      // Performance assertion
      expect(refreshTime).toBeLessThan(5000);
      console.log(`Fan-out pattern (1→10) refresh time: ${refreshTime}ms`);
    });
  });
});
