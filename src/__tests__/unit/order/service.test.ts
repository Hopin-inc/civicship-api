import "reflect-metadata";
import { container } from "tsyringe";
import { registerProductionDependencies } from "../../../application/provider";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
// import { NftTestHelper } from "../../helper/nft-test-helper";
import OrderService from "../../../application/domain/order/service";
import { PrismaClientIssuer } from "../../../infrastructure/prisma/client";

describe("OrderService", () => {
  let orderService: OrderService;
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();
    orderService = container.resolve(OrderService);
    issuer = container.resolve(PrismaClientIssuer);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  describe("create", () => {
    it("should create order with correct total amount calculation", async () => {
      const user = await TestDataSourceHelper.createUser({
        name: "Test User",
        slug: "test-user",
        currentPrefecture: "TOKYO" as any
      });

      const order = await orderService.create(
        { issuer } as any,
        {
          userId: user.id,
          items: [
            { productId: "product-1", quantity: 2, priceSnapshot: 1000 },
            { productId: "product-2", quantity: 3, priceSnapshot: 1500 }
          ]
        }
      );

      expect(order.totalAmount).toBe(6500); // (2 * 1000) + (3 * 1500)
      expect(order.items).toHaveLength(2);
      expect(order.userId).toBe(user.id);
    });

    it("should create order with single item", async () => {
      const user = await TestDataSourceHelper.createUser({
        name: "Test User",
        slug: "test-user",
        currentPrefecture: "TOKYO" as any
      });

      const order = await orderService.create(
        { issuer } as any,
        {
          userId: user.id,
          items: [
            { productId: "product-1", quantity: 5, priceSnapshot: 2000 }
          ]
        }
      );

      expect(order.totalAmount).toBe(10000); // 5 * 2000
      expect(order.items).toHaveLength(1);
      expect(order.items[0].quantity).toBe(5);
      expect(order.items[0].priceSnapshot).toBe(2000);
    });

    it("should create order within transaction", async () => {
      const user = await TestDataSourceHelper.createUser({
        name: "Test User",
        slug: "test-user",
        currentPrefecture: "TOKYO" as any
      });

      await issuer.internal(async (tx) => {
        const order = await orderService.create(
          { issuer } as any,
          {
            userId: user.id,
            items: [
              { productId: "product-1", quantity: 1, priceSnapshot: 1000 }
            ]
          },
          tx
        );

        expect(order.totalAmount).toBe(1000);
        expect(order.items).toHaveLength(1);
      });
    });

    it("should handle zero quantity gracefully", async () => {
      const user = await TestDataSourceHelper.createUser({
        name: "Test User",
        slug: "test-user",
        currentPrefecture: "TOKYO" as any
      });

      const order = await orderService.create(
        { issuer } as any,
        {
          userId: user.id,
          items: [
            { productId: "product-1", quantity: 0, priceSnapshot: 1000 }
          ]
        }
      );

      expect(order.totalAmount).toBe(0);
      expect(order.items[0].quantity).toBe(0);
    });
  });

  describe("updateOrderWithExternalRef", () => {
    it("should update order with external reference", async () => {
      const user = await TestDataSourceHelper.createUser({
        name: "Test User",
        slug: "test-user",
        currentPrefecture: "TOKYO" as any
      });

      const order = await orderService.create(
        { issuer } as any,
        {
          userId: user.id,
          items: [
            { productId: "product-1", quantity: 1, priceSnapshot: 1000 }
          ]
        }
      );

      const updatedOrder = await orderService.updateOrderWithExternalRef(
        { issuer } as any,
        order.id,
        "external-ref-123"
      );

      expect(updatedOrder.externalRef).toBe("external-ref-123");
    });

    it("should update order with external reference within transaction", async () => {
      const user = await TestDataSourceHelper.createUser({
        name: "Test User",
        slug: "test-user",
        currentPrefecture: "TOKYO" as any
      });

      const order = await orderService.create(
        { issuer } as any,
        {
          userId: user.id,
          items: [
            { productId: "product-1", quantity: 1, priceSnapshot: 1000 }
          ]
        }
      );

      await issuer.internal(async (tx) => {
        const updatedOrder = await orderService.updateOrderWithExternalRef(
          { issuer } as any,
          order.id,
          "external-ref-456",
          tx
        );

        expect(updatedOrder.externalRef).toBe("external-ref-456");
      });
    });
  });

  describe("error handling", () => {
    it("should handle invalid user ID", async () => {
      await expect(
        orderService.create(
          { issuer } as any,
          {
            userId: "non-existent-user",
            items: [
              { productId: "product-1", quantity: 1, priceSnapshot: 1000 }
            ]
          }
        )
      ).rejects.toThrow();
    });

    it("should handle empty items array", async () => {
      const user = await TestDataSourceHelper.createUser({
        name: "Test User",
        slug: "test-user",
        currentPrefecture: "TOKYO" as any
      });

      const order = await orderService.create(
        { issuer } as any,
        {
          userId: user.id,
          items: []
        }
      );

      expect(order.totalAmount).toBe(0);
      expect(order.items).toHaveLength(0);
    });
  });
});
