import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { CurrentPrefecture, TransactionReason, WalletType } from "@prisma/client";

describe("Transaction Chain (parentTxId)", () => {
  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  async function setupBasic() {
    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "point",
    });
    const communityWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.COMMUNITY,
      community: { connect: { id: community.id } },
    });
    return { community, communityWallet };
  }

  async function createUser(name: string, slug: string, community: { id: string }) {
    const user = await TestDataSourceHelper.createUser({
      name,
      slug,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const wallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: community.id } },
      user: { connect: { id: user.id } },
    });
    return { user, wallet };
  }

  describe("GRANTトランザクション", () => {
    it("parentTxId は null になる", async () => {
      const { community, communityWallet } = await setupBasic();
      const { wallet: userWallet } = await createUser("User A", "user-a", community);

      const grant = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: communityWallet.id } },
        toWallet: { connect: { id: userWallet.id } },
        fromPointChange: -100,
        toPointChange: 100,
        reason: TransactionReason.GRANT,
      });

      const parentTxId = await TestDataSourceHelper.getParentTxId(grant.id);
      expect(parentTxId).toBeNull();
    });
  });

  describe("DONATION チェーン", () => {
    it("GRANT後の最初のDONATIONはGRANTをparentTxIdに持つ", async () => {
      const { community, communityWallet } = await setupBasic();
      const { wallet: walletA } = await createUser("User A", "user-a", community);
      const { wallet: walletB } = await createUser("User B", "user-b", community);

      const grant = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: communityWallet.id } },
        toWallet: { connect: { id: walletA.id } },
        fromPointChange: -100,
        toPointChange: 100,
        reason: TransactionReason.GRANT,
      });

      const donation = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: walletA.id } },
        toWallet: { connect: { id: walletB.id } },
        fromPointChange: -50,
        toPointChange: 50,
        reason: TransactionReason.DONATION,
        parentTx: { connect: { id: grant.id } },
      });

      const parentTxId = await TestDataSourceHelper.getParentTxId(donation.id);
      expect(parentTxId).toBe(grant.id);
    });

    it("DONATION → DONATION で連鎖する", async () => {
      const { community, communityWallet } = await setupBasic();
      const { wallet: walletA } = await createUser("User A", "user-a", community);
      const { wallet: walletB } = await createUser("User B", "user-b", community);
      const { wallet: walletC } = await createUser("User C", "user-c", community);

      const grant = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: communityWallet.id } },
        toWallet: { connect: { id: walletA.id } },
        fromPointChange: -100,
        toPointChange: 100,
        reason: TransactionReason.GRANT,
      });

      const donation1 = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: walletA.id } },
        toWallet: { connect: { id: walletB.id } },
        fromPointChange: -50,
        toPointChange: 50,
        reason: TransactionReason.DONATION,
        parentTx: { connect: { id: grant.id } },
      });

      const donation2 = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: walletB.id } },
        toWallet: { connect: { id: walletC.id } },
        fromPointChange: -25,
        toPointChange: 25,
        reason: TransactionReason.DONATION,
        parentTx: { connect: { id: donation1.id } },
      });

      expect(await TestDataSourceHelper.getParentTxId(donation1.id)).toBe(grant.id);
      expect(await TestDataSourceHelper.getParentTxId(donation2.id)).toBe(donation1.id);
    });

    it("複数受信がある場合、最も直近の受信txがparentになる", async () => {
      const { community, communityWallet } = await setupBasic();
      await createUser("User A", "user-a", community);
      const { wallet: walletB } = await createUser("User B", "user-b", community);
      const { wallet: walletC } = await createUser("User C", "user-c", community);

      // walletB が2回受信する
      const grant1 = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: communityWallet.id } },
        toWallet: { connect: { id: walletB.id } },
        fromPointChange: -100,
        toPointChange: 100,
        reason: TransactionReason.GRANT,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const grant2 = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: communityWallet.id } },
        toWallet: { connect: { id: walletB.id } },
        fromPointChange: -50,
        toPointChange: 50,
        reason: TransactionReason.GRANT,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      // walletB から walletC へ送る → 直近受信の grant2 が parent になる
      const donation = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: walletB.id } },
        toWallet: { connect: { id: walletC.id } },
        fromPointChange: -30,
        toPointChange: 30,
        reason: TransactionReason.DONATION,
        parentTx: { connect: { id: grant2.id } },
      });

      const parentTxId = await TestDataSourceHelper.getParentTxId(donation.id);
      expect(parentTxId).toBe(grant2.id);
      expect(parentTxId).not.toBe(grant1.id);
    });
  });

  describe("chainDepth の検証", () => {
    it("GRANTのchainDepthは1", async () => {
      const { community, communityWallet } = await setupBasic();
      const { wallet: userWallet } = await createUser("User A", "user-a", community);

      const grant = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: communityWallet.id } },
        toWallet: { connect: { id: userWallet.id } },
        fromPointChange: -100,
        toPointChange: 100,
        reason: TransactionReason.GRANT,
        chainDepth: 1,
      });

      expect(await TestDataSourceHelper.getChainDepth(grant.id)).toBe(1);
    });

    it("GRANT → DONATION でdepthが2になる", async () => {
      const { community, communityWallet } = await setupBasic();
      const { wallet: walletA } = await createUser("User A", "user-a", community);
      const { wallet: walletB } = await createUser("User B", "user-b", community);

      const grant = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: communityWallet.id } },
        toWallet: { connect: { id: walletA.id } },
        fromPointChange: -100,
        toPointChange: 100,
        reason: TransactionReason.GRANT,
        chainDepth: 1,
      });

      const donation = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: walletA.id } },
        toWallet: { connect: { id: walletB.id } },
        fromPointChange: -50,
        toPointChange: 50,
        reason: TransactionReason.DONATION,
        parentTx: { connect: { id: grant.id } },
        chainDepth: 2,
      });

      expect(await TestDataSourceHelper.getChainDepth(grant.id)).toBe(1);
      expect(await TestDataSourceHelper.getChainDepth(donation.id)).toBe(2);
    });

    it("GRANT → DONATION → DONATION でdepthが3になる", async () => {
      const { community, communityWallet } = await setupBasic();
      const { wallet: walletA } = await createUser("User A", "user-a", community);
      const { wallet: walletB } = await createUser("User B", "user-b", community);
      const { wallet: walletC } = await createUser("User C", "user-c", community);

      const grant = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: communityWallet.id } },
        toWallet: { connect: { id: walletA.id } },
        fromPointChange: -100,
        toPointChange: 100,
        reason: TransactionReason.GRANT,
        chainDepth: 1,
      });

      const donation1 = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: walletA.id } },
        toWallet: { connect: { id: walletB.id } },
        fromPointChange: -50,
        toPointChange: 50,
        reason: TransactionReason.DONATION,
        parentTx: { connect: { id: grant.id } },
        chainDepth: 2,
      });

      const donation2 = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: walletB.id } },
        toWallet: { connect: { id: walletC.id } },
        fromPointChange: -25,
        toPointChange: 25,
        reason: TransactionReason.DONATION,
        parentTx: { connect: { id: donation1.id } },
        chainDepth: 3,
      });

      expect(await TestDataSourceHelper.getChainDepth(donation2.id)).toBe(3);
    });

    it("チェーン外のトランザクション（TICKET_PURCHASED等）はchainDepthがnull", async () => {
      const { community, communityWallet } = await setupBasic();
      const { wallet: userWallet } = await createUser("User A", "user-a", community);

      const ticket = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: userWallet.id } },
        toWallet: { connect: { id: communityWallet.id } },
        fromPointChange: -50,
        toPointChange: 50,
        reason: TransactionReason.TICKET_PURCHASED,
      });

      expect(await TestDataSourceHelper.getChainDepth(ticket.id)).toBeNull();
    });
  });

  describe("チェーン深さの計算", () => {
    it("深さN のチェーンを正しく辿れる", async () => {
      const { community, communityWallet } = await setupBasic();
      const CHAIN_LENGTH = 5;

      const users = await Promise.all(
        Array.from({ length: CHAIN_LENGTH }, (_, i) =>
          createUser(`User ${i}`, `user-${i}`, community),
        ),
      );

      const grant = await TestDataSourceHelper.createTransaction({
        fromWallet: { connect: { id: communityWallet.id } },
        toWallet: { connect: { id: users[0].wallet.id } },
        fromPointChange: -1000,
        toPointChange: 1000,
        reason: TransactionReason.GRANT,
      });

      let prevTxId = grant.id;
      let lastTxId = grant.id;

      for (let i = 1; i < CHAIN_LENGTH; i++) {
        await new Promise((resolve) => setTimeout(resolve, 5));
        const tx = await TestDataSourceHelper.createTransaction({
          fromWallet: { connect: { id: users[i - 1].wallet.id } },
          toWallet: { connect: { id: users[i].wallet.id } },
          fromPointChange: -100,
          toPointChange: 100,
          reason: TransactionReason.DONATION,
          parentTx: { connect: { id: prevTxId } },
        });
        prevTxId = tx.id;
        lastTxId = tx.id;
      }

      // 末尾から辿って深さを検証
      let depth = 0;
      let currentTxId: string | null = lastTxId;
      while (currentTxId !== null) {
        depth++;
        currentTxId = await TestDataSourceHelper.getParentTxId(currentTxId);
      }

      expect(depth).toBe(CHAIN_LENGTH); // GRANT(1) + DONATION×4 = 5
    });
  });
});
