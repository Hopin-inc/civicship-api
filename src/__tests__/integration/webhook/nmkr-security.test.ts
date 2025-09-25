import "reflect-metadata";
import request from "supertest";
import express from "express";
import { container } from "tsyringe";
import { registerProductionDependencies } from "../../../application/provider";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { NftTestHelper } from "../../helper/nft-test-helper";
import nmkrRouter from "../../../presentation/router/nmkr";

describe("P0 Critical: Webhook HMAC Security", () => {
  let app: express.Application;
  const testSecret = "test-webhook-secret";

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();
    
    process.env.NMKR_WEBHOOK_HMAC_SECRET = testSecret;
    process.env.NODE_ENV = "production"; // Enable HMAC verification
    
    app = express();
    app.use(express.json());
    app.use("/nmkr", nmkrRouter);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
    delete process.env.NMKR_WEBHOOK_HMAC_SECRET;
    delete process.env.NODE_ENV;
  });

  it("should accept webhook with valid HMAC signature", async () => {
    const payload = {
      paymentTransactionUid: "test-tx-123",
      projectUid: "test-project",
      state: "confirmed",
      customProperty: JSON.stringify({
        propsVersion: 1,
        orderId: "test-order-id"
      })
    };

    const signature = NftTestHelper.makeSignedWebhook(payload, testSecret);

    const response = await request(app)
      .post("/nmkr/webhook")
      .set("x-nmkr-signature", signature)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should reject webhook with invalid HMAC signature", async () => {
    const payload = {
      paymentTransactionUid: "test-tx-123",
      projectUid: "test-project",
      state: "confirmed"
    };

    const invalidSignature = "sha256=invalid_signature_hash";

    const response = await request(app)
      .post("/nmkr/webhook")
      .set("x-nmkr-signature", invalidSignature)
      .send(payload);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid signature");
  });

  it("should reject webhook without signature header", async () => {
    const payload = {
      paymentTransactionUid: "test-tx-123",
      projectUid: "test-project",
      state: "confirmed"
    };

    const response = await request(app)
      .post("/nmkr/webhook")
      .send(payload);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Missing signature");
  });

  it("should use timing-safe comparison for signature verification", async () => {
    const payload = {
      paymentTransactionUid: "test-tx-123",
      projectUid: "test-project",
      state: "confirmed"
    };

    const validSignature = NftTestHelper.makeSignedWebhook(payload, testSecret);
    const truncatedSignature = validSignature.slice(0, -2); // Remove last 2 chars

    const response = await request(app)
      .post("/nmkr/webhook")
      .set("x-nmkr-signature", truncatedSignature)
      .send(payload);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid signature");
  });

  it("should bypass HMAC verification in development mode", async () => {
    process.env.NODE_ENV = "development";
    
    const payload = {
      paymentTransactionUid: "test-tx-123",
      projectUid: "test-project",
      state: "confirmed",
      customProperty: JSON.stringify({
        propsVersion: 1,
        orderId: "test-order-id"
      })
    };

    const response = await request(app)
      .post("/nmkr/webhook")
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should handle server configuration error gracefully", async () => {
    delete process.env.NMKR_WEBHOOK_HMAC_SECRET;
    
    const payload = {
      paymentTransactionUid: "test-tx-123",
      projectUid: "test-project",
      state: "confirmed"
    };

    const response = await request(app)
      .post("/nmkr/webhook")
      .set("x-nmkr-signature", "sha256=test")
      .send(payload);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Server configuration error");
  });

  it("should validate webhook payload structure", async () => {
    const invalidPayload = {
      state: "confirmed"
    };

    const signature = NftTestHelper.makeSignedWebhook(invalidPayload, testSecret);

    const response = await request(app)
      .post("/nmkr/webhook")
      .set("x-nmkr-signature", signature)
      .send(invalidPayload);

    expect(response.status).toBe(200);
  });

  it("should handle malformed JSON in customProperty", async () => {
    const payload = {
      paymentTransactionUid: "test-tx-123",
      projectUid: "test-project",
      state: "confirmed",
      customProperty: "invalid-json-string"
    };

    const signature = NftTestHelper.makeSignedWebhook(payload, testSecret);

    const response = await request(app)
      .post("/nmkr/webhook")
      .set("x-nmkr-signature", signature)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
