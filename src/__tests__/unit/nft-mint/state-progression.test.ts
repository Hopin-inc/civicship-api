import "reflect-metadata";
import { container } from "tsyringe";
import { registerProductionDependencies } from "../../../application/provider";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { NftTestHelper } from "../../helper/nft-test-helper";
import NftMintWebhookService from "../../../application/domain/account/nft-mint/webhook/service";
import { PrismaClientIssuer } from "../../../infrastructure/prisma/client";
import { NftMintStatus } from "@prisma/client";
import { IContext } from "../../../types/server";

type ProductWithNftProduct = {
  id: string;
  name: string;
  price: number;
  type: string;
  nftProduct: {
    id: string;
    maxSupply: number | null;
    externalRef: string | null;
    policyId: string;
    assetName: string;
  } | null;
};

type UserWithId = {
  id: string;
  name: string;
  slug: string;
  currentPrefecture: string;
};


describe("P0 Critical: Forward-Only State Progression", () => {
  let webhookService: NftMintWebhookService;
  let issuer: PrismaClientIssuer;
  let mockContext: IContext;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();
    
    webhookService = container.resolve(NftMintWebhookService);
    issuer = container.resolve(PrismaClientIssuer);
    mockContext = {
      issuer,
      user: { id: 'system', role: 'SYSTEM' }
    } as any;
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should allow forward progression QUEUED -> SUBMITTED -> MINTED", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: "TOKYO" as any
    }) as UserWithId;
    const walletId = "dummy-wallet-id";
    const products = await NftTestHelper.seedProducts();
    const product = products[0] as ProductWithNftProduct;
    const order = await NftTestHelper.createTestOrder({
      userId: user.id,
      productId: product.id,
      quantity: 1
    });

    const nftMint = await NftTestHelper.createNftMint({
      status: NftMintStatus.QUEUED,
      orderItemId: order.items[0].id,
      nftWalletId: walletId
    });

    await webhookService.processStateTransition(
      mockContext,
      nftMint.id,
      'confirmed',
      undefined,
      'tx-123'
    );

    let updatedMint = await TestDataSourceHelper.findNftMintById(nftMint.id);
    expect(updatedMint?.status).toBe(NftMintStatus.SUBMITTED);

    await webhookService.processStateTransition(
      mockContext,
      nftMint.id,
      'finished',
      'tx_hash_final',
      'tx-456'
    );

    updatedMint = await TestDataSourceHelper.findNftMintById(nftMint.id);
    expect(updatedMint?.status).toBe(NftMintStatus.MINTED);
    expect(updatedMint?.txHash).toBe('tx_hash_final');
  });

  it("should reject backward state transitions", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: "TOKYO" as any
    }) as UserWithId;
    const walletId = "dummy-wallet-id";
    const products = await NftTestHelper.seedProducts();
    const product = products[0] as ProductWithNftProduct;
    const order = await NftTestHelper.createTestOrder({
      userId: user.id,
      productId: product.id,
      quantity: 1
    });

    const nftMint = await NftTestHelper.createNftMint({
      status: NftMintStatus.MINTED, // Already minted
      orderItemId: order.items[0].id,
      nftWalletId: walletId,
      txHash: 'original_tx_hash'
    });

    await webhookService.processStateTransition(
      mockContext,
      nftMint.id,
      'confirmed', // This would normally set to SUBMITTED
      undefined,
      'tx-789'
    );

    const updatedMint = await TestDataSourceHelper.findNftMintById(nftMint.id);
    expect(updatedMint?.status).toBe(NftMintStatus.MINTED); // Unchanged
    expect(updatedMint?.txHash).toBe('original_tx_hash'); // Unchanged
  });

  it("should prevent txHash null overwrite", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: "TOKYO" as any
    }) as UserWithId;
    const walletId = "dummy-wallet-id";
    const products = await NftTestHelper.seedProducts();
    const product = products[0] as ProductWithNftProduct;
    const order = await NftTestHelper.createTestOrder({
      userId: user.id,
      productId: product.id,
      quantity: 1
    });

    const nftMint = await NftTestHelper.createNftMint({
      status: NftMintStatus.SUBMITTED,
      orderItemId: order.items[0].id,
      nftWalletId: walletId,
      txHash: 'existing_tx_hash'
    });

    await webhookService.processStateTransition(
      mockContext,
      nftMint.id,
      'finished',
      undefined, // null txHash
      'tx-null-attempt'
    );

    const updatedMint = await TestDataSourceHelper.findNftMintById(nftMint.id);
    expect(updatedMint?.status).toBe(NftMintStatus.MINTED);
    expect(updatedMint?.txHash).toBe('existing_tx_hash'); // Should not be overwritten
  });

  it("should handle duplicate webhook events idempotently", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: "TOKYO" as any
    }) as UserWithId;
    const walletId = "dummy-wallet-id";
    const products = await NftTestHelper.seedProducts();
    const product = products[0] as ProductWithNftProduct;
    const order = await NftTestHelper.createTestOrder({
      userId: user.id,
      productId: product.id,
      quantity: 1
    });

    const nftMint = await NftTestHelper.createNftMint({
      status: NftMintStatus.QUEUED,
      orderItemId: order.items[0].id,
      nftWalletId: walletId
    });

    await webhookService.processStateTransition(
      mockContext,
      nftMint.id,
      'confirmed',
      'tx_hash_1',
      'tx-duplicate-1'
    );

    await webhookService.processStateTransition(
      mockContext,
      nftMint.id,
      'confirmed',
      'tx_hash_2',
      'tx-duplicate-2'
    );

    const updatedMint = await TestDataSourceHelper.findNftMintById(nftMint.id);
    expect(updatedMint?.status).toBe(NftMintStatus.SUBMITTED);
    expect(updatedMint?.txHash).toBe('tx_hash_1'); // First txHash preserved
  });

  it("should handle state mapping correctly", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: "TOKYO" as any
    }) as UserWithId;
    const walletId = "dummy-wallet-id";
    const products = await NftTestHelper.seedProducts();
    const product = products[0] as ProductWithNftProduct;
    const order = await NftTestHelper.createTestOrder({
      userId: user.id,
      productId: product.id,
      quantity: 1
    });

    const nftMint = await NftTestHelper.createNftMint({
      status: NftMintStatus.QUEUED,
      orderItemId: order.items[0].id,
      nftWalletId: walletId
    });

    const testCases = [
      { nmkrState: 'confirmed', expectedStatus: NftMintStatus.SUBMITTED },
      { nmkrState: 'finished', expectedStatus: NftMintStatus.MINTED },
      { nmkrState: 'canceled', expectedStatus: NftMintStatus.FAILED },
      { nmkrState: 'expired', expectedStatus: NftMintStatus.FAILED }
    ];

    for (const testCase of testCases) {
      await issuer.internal(async (tx) => {
        await tx.nftMint.update({
          where: { id: nftMint.id },
          data: { status: NftMintStatus.QUEUED, txHash: null }
        });
      });

      await webhookService.processStateTransition(
        mockContext,
        nftMint.id,
        testCase.nmkrState,
        'test_tx_hash',
        `tx-${testCase.nmkrState}`
      );

      const updatedMint = await TestDataSourceHelper.findNftMintById(nftMint.id);
      expect(updatedMint?.status).toBe(testCase.expectedStatus);
    }
  });
});
