// import "reflect-metadata";
// import { container } from "tsyringe";
// import { registerProductionDependencies } from "../../../application/provider";
// import TestDataSourceHelper from "../../helper/test-data-source-helper";
// import { NftTestHelper } from "../../helper/nft-test-helper";
// import ProductService from "../../../application/domain/product/service";
// import { PrismaClientIssuer } from "../../../infrastructure/prisma/client";
// import { OrderStatus, NftMintStatus, WalletType } from "@prisma/client";
//
//
// describe("P0 Critical: Inventory SUM Aggregation", () => {
//   let productService: ProductService;
//   let issuer: PrismaClientIssuer;
//
//   beforeEach(async () => {
//     await TestDataSourceHelper.deleteAll();
//     jest.clearAllMocks();
//     container.reset();
//     registerProductionDependencies();
//     productService = container.resolve(ProductService);
//     issuer = container.resolve(PrismaClientIssuer);
//   });
//
//   afterAll(async () => {
//     await TestDataSourceHelper.disconnect();
//   });
//
//   it("should aggregate quantity SUM not count for PENDING orders", async () => {
//     const [product] = await NftTestHelper.seedProducts({ maxSupply: 100 });
//     const user = await TestDataSourceHelper.createUser({
//       name: "Test User",
//       slug: "test-user",
//       currentPrefecture: "TOKYO" as any
//     });
//
//     await NftTestHelper.createTestOrder({
//       userId: user.id,
//       productId: product.id,
//       quantity: 5,
//       status: OrderStatus.PENDING
//     });
//     await NftTestHelper.createTestOrder({
//       userId: user.id,
//       productId: product.id,
//       quantity: 3,
//       status: OrderStatus.PENDING
//     });
//
//     const inventory = await productService.calculateInventory(
//       { issuer } as any,
//       product.id
//     );
//
//     expect(inventory.reserved).toBe(8);
//     expect(inventory.available).toBe(92); // 100 - 8
//   });
//
//   it("should aggregate quantity SUM for PAID orders awaiting mint", async () => {
//     const [product] = await NftTestHelper.seedProducts({ maxSupply: 50 });
//     const user = await TestDataSourceHelper.createUser({
//       name: "Test User",
//       slug: "test-user",
//       currentPrefecture: "TOKYO" as any
//     });
//
//     await NftTestHelper.createTestOrder({
//       userId: user.id,
//       productId: product.id,
//       quantity: 7,
//       status: OrderStatus.PAID
//     });
//
//     await NftTestHelper.createTestOrder({
//       userId: user.id,
//       productId: product.id,
//       quantity: 4,
//       status: OrderStatus.PAID
//     });
//
//     const inventory = await productService.calculateInventory(
//       { issuer } as any,
//       product.id
//     );
//
//     expect(inventory.soldPendingMint).toBe(11);
//     expect(inventory.available).toBe(39); // 50 - 11
//   });
//
//   it("should count MINTED based on NftMint success records", async () => {
//     const [product] = await NftTestHelper.seedProducts({ maxSupply: 30 });
//     const user = await TestDataSourceHelper.createUser({
//       name: "Test User",
//       slug: "test-user",
//       currentPrefecture: "TOKYO" as any
//     });
//     const community = await TestDataSourceHelper.createCommunity({
//       name: "Test Community",
//       pointName: "Test Points"
//     });
//     const wallet = await TestDataSourceHelper.createWallet({
//       type: WalletType.MEMBER,
//       user: { connect: { id: user.id } },
//       community: { connect: { id: community.id } }
//     });
//
//     const order = await NftTestHelper.createTestOrder({
//       userId: user.id,
//       productId: product.id,
//       quantity: 6,
//       status: OrderStatus.PAID
//     });
//
//     for (let i = 0; i < 6; i++) {
//       await NftTestHelper.createNftMint({
//         status: NftMintStatus.MINTED,
//         orderItemId: order.items[0].id,
//         nftWalletId: wallet.id,
//         txHash: `tx_hash_${i}`
//       });
//     }
//
//     const inventory = await productService.calculateInventory(
//       { issuer } as any,
//       product.id
//     );
//
//     expect(inventory.minted).toBe(6);
//     expect(inventory.available).toBe(24); // 30 - 6
//   });
//
//   it("should handle products without maxSupply as unlimited", async () => {
//     const products = await NftTestHelper.seedProducts({ maxSupply: null });
//     const product = products[0] as any;
//     const user = await TestDataSourceHelper.createUser({
//       name: "Test User",
//       slug: "test-user",
//       currentPrefecture: "TOKYO" as any
//     });
//
//     await NftTestHelper.createTestOrder({
//       userId: user.id,
//       productId: product.id,
//       quantity: 1000,
//       status: OrderStatus.PENDING
//     });
//
//     const inventory = await productService.calculateInventory(
//       { issuer } as any,
//       product.id
//     );
//
//     expect(inventory.maxSupply).toBeNull();
//     expect(inventory.available).toBe(Infinity);
//   });
//
//   it("should correctly calculate complex inventory scenarios", async () => {
//     const [product] = await NftTestHelper.seedProducts({ maxSupply: 100 });
//     const user = await TestDataSourceHelper.createUser({
//       name: "Test User",
//       slug: "test-user",
//       currentPrefecture: "TOKYO" as any
//     });
//     const community = await TestDataSourceHelper.createCommunity({
//       name: "Test Community",
//       pointName: "Test Points"
//     });
//     const wallet = await TestDataSourceHelper.createWallet({
//       type: WalletType.MEMBER,
//       user: { connect: { id: user.id } },
//       community: { connect: { id: community.id } }
//     });
//
//     await NftTestHelper.createTestOrder({
//       userId: user.id,
//       productId: product.id,
//       quantity: 10,
//       status: OrderStatus.PENDING
//     });
//
//     const paidOrder = await NftTestHelper.createTestOrder({
//       userId: user.id,
//       productId: product.id,
//       quantity: 15,
//       status: OrderStatus.PAID
//     });
//
//     for (let i = 0; i < 5; i++) {
//       await NftTestHelper.createNftMint({
//         status: NftMintStatus.MINTED,
//         orderItemId: paidOrder.items[0].id,
//         nftWalletId: wallet.id,
//         txHash: `tx_hash_${i}`
//       });
//     }
//
//     const inventory = await productService.calculateInventory(
//       { issuer } as any,
//       product.id
//     );
//
//     expect(inventory.reserved).toBe(10); // PENDING
//     expect(inventory.soldPendingMint).toBe(15); // PAID
//     expect(inventory.minted).toBe(5); // MINTED NftMint records
//     expect(inventory.available).toBe(70); // 100 - 10 - 15 - 5
//   });
// });
