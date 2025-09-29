// import "reflect-metadata";
// import request from "supertest";
// import express from "express";
// import { container } from "tsyringe";
// import { registerProductionDependencies } from "../../../application/provider";
// import TestDataSourceHelper from "../../helper/test-data-source-helper";
// import { NftTestHelper } from "../../helper/nft-test-helper";
// import nmkrRouter from "../../../presentation/router/nmkr";
// import { OrderStatus, NftMintStatus } from "@prisma/client";
//
// type ProductWithNftProduct = {
//   id: string;
//   name: string;
//   price: number;
//   type: string;
//   nftProduct: {
//     id: string;
//     maxSupply: number | null;
//     externalRef: string | null;
//     policyId: string;
//     assetName: string;
//   } | null;
// };
//
//
//
// describe("Integration: NMKR Webhook Processing", () => {
//   let app: express.Application;
//   const testSecret = "test-webhook-secret";
//
//   beforeEach(async () => {
//     await TestDataSourceHelper.deleteAll();
//     jest.clearAllMocks();
//     container.reset();
//     registerProductionDependencies();
//
//     process.env.NMKR_WEBHOOK_HMAC_SECRET = testSecret;
//     process.env.NODE_ENV = "production";
//
//     app = express();
//     app.use(express.json());
//     app.use("/nmkr", nmkrRouter);
//   });
//
//   afterAll(async () => {
//     await TestDataSourceHelper.disconnect();
//     delete process.env.NMKR_WEBHOOK_HMAC_SECRET;
//     delete process.env.NODE_ENV;
//   });
//
//   it("should process order payment confirmation webhook", async () => {
//     const user = await TestDataSourceHelper.createUser({
//       name: "Test User",
//       slug: "test-user",
//       currentPrefecture: "TOKYO" as any
//     });
//     const products = await NftTestHelper.seedProducts();
//     const product = products[0] as ProductWithNftProduct;
//     const order = await NftTestHelper.createTestOrder({
//       userId: user.id,
//       productId: product.id,
//       quantity: 1,
//       status: OrderStatus.PENDING
//     });
//
//     const payload = {
//       paymentTransactionUid: "test-tx-123",
//       projectUid: "test-project",
//       state: "confirmed",
//       customProperty: JSON.stringify({
//         propsVersion: 1,
//         orderId: order.id
//       })
//     };
//
//     const signature = NftTestHelper.makeSignedWebhook(payload, testSecret);
//
//     const response = await request(app)
//       .post("/nmkr/webhook")
//       .set("x-nmkr-signature", signature)
//       .send(payload);
//
//     expect(response.status).toBe(200);
//     expect(response.body.success).toBe(true);
//
//   });
//
//   it("should process NFT mint state transition webhook", async () => {
//     const user = await TestDataSourceHelper.createUser({
//       name: "Test User",
//       slug: "test-user",
//       currentPrefecture: "TOKYO" as any
//     });
//     const walletId = "dummy-wallet-id";
//     const products = await NftTestHelper.seedProducts();
//     const product = products[0] as ProductWithNftProduct;
//     const order = await NftTestHelper.createTestOrder({
//       userId: user.id,
//       productId: product.id,
//       quantity: 1
//     });
//
//     const nftMint = await NftTestHelper.createNftMint({
//       status: NftMintStatus.QUEUED,
//       orderItemId: order.items[0].id,
//       nftWalletId: walletId
//     });
//
//     const payload = {
//       paymentTransactionUid: "test-tx-456",
//       projectUid: "test-project",
//       state: "finished",
//       txHash: "tx_hash_final",
//       customProperty: JSON.stringify({
//         propsVersion: 1,
//         nftMintId: nftMint.id
//       })
//     };
//
//     const signature = NftTestHelper.makeSignedWebhook(payload, testSecret);
//
//     const response = await request(app)
//       .post("/nmkr/webhook")
//       .set("x-nmkr-signature", signature)
//       .send(payload);
//
//     expect(response.status).toBe(200);
//     expect(response.body.success).toBe(true);
//
//     const updatedMint = await TestDataSourceHelper.findNftMintById(nftMint.id);
//     expect(updatedMint?.status).toBe(NftMintStatus.MINTED);
//     expect(updatedMint?.txHash).toBe("tx_hash_final");
//   });
//
//   it("should handle webhook with missing customProperty gracefully", async () => {
//     const payload = {
//       paymentTransactionUid: "test-tx-789",
//       projectUid: "test-project",
//       state: "confirmed"
//     };
//
//     const signature = NftTestHelper.makeSignedWebhook(payload, testSecret);
//
//     const response = await request(app)
//       .post("/nmkr/webhook")
//       .set("x-nmkr-signature", signature)
//       .send(payload);
//
//     expect(response.status).toBe(200);
//     expect(response.body.success).toBe(true);
//   });
//
//   it("should handle webhook with invalid customProperty JSON", async () => {
//     const payload = {
//       paymentTransactionUid: "test-tx-invalid",
//       projectUid: "test-project",
//       state: "confirmed",
//       customProperty: "invalid-json-string"
//     };
//
//     const signature = NftTestHelper.makeSignedWebhook(payload, testSecret);
//
//     const response = await request(app)
//       .post("/nmkr/webhook")
//       .set("x-nmkr-signature", signature)
//       .send(payload);
//
//     expect(response.status).toBe(200);
//     expect(response.body.success).toBe(true);
//   });
//
//   it("should handle webhook with missing orderId and nftMintId", async () => {
//     const payload = {
//       paymentTransactionUid: "test-tx-missing",
//       projectUid: "test-project",
//       state: "confirmed",
//       customProperty: JSON.stringify({
//         propsVersion: 1
//       })
//     };
//
//     const signature = NftTestHelper.makeSignedWebhook(payload, testSecret);
//
//     const response = await request(app)
//       .post("/nmkr/webhook")
//       .set("x-nmkr-signature", signature)
//       .send(payload);
//
//     expect(response.status).toBe(200);
//     expect(response.body.success).toBe(true);
//   });
//
//   it("should be idempotent for duplicate webhooks", async () => {
//     const user = await TestDataSourceHelper.createUser({
//       name: "Test User",
//       slug: "test-user",
//       currentPrefecture: "TOKYO" as any
//     });
//     const products = await NftTestHelper.seedProducts();
//     const product = products[0] as ProductWithNftProduct;
//     const order = await NftTestHelper.createTestOrder({
//       userId: user.id,
//       productId: product.id,
//       quantity: 1,
//       status: OrderStatus.PENDING
//     });
//
//     const payload = {
//       paymentTransactionUid: "test-tx-duplicate",
//       projectUid: "test-project",
//       state: "confirmed",
//       customProperty: JSON.stringify({
//         propsVersion: 1,
//         orderId: order.id
//       })
//     };
//
//     const signature = NftTestHelper.makeSignedWebhook(payload, testSecret);
//
//     const response1 = await request(app)
//       .post("/nmkr/webhook")
//       .set("x-nmkr-signature", signature)
//       .send(payload);
//
//     const response2 = await request(app)
//       .post("/nmkr/webhook")
//       .set("x-nmkr-signature", signature)
//       .send(payload);
//
//     expect(response1.status).toBe(200);
//     expect(response2.status).toBe(200);
//
//   });
// });
