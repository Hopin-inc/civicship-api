import "reflect-metadata";
import { container } from "tsyringe";
import { registerProductionDependencies } from "../../../application/provider";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { NftTestHelper } from "../../helper/nft-test-helper";
import OrderUseCase from "../../../application/domain/order/usecase";
import { PrismaClientIssuer } from "../../../infrastructure/prisma/client";
import { IContext } from "../../../types/server";
import ProductService from "../../../application/domain/product/service";

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

describe("Integration: Complete Order Flow", () => {
  let orderUseCase: OrderUseCase;
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();
    
    const mockNmkrClient = NftTestHelper.createNmkrStub('success');
    container.register("NmkrClient", { useValue: mockNmkrClient });
    
    orderUseCase = container.resolve(OrderUseCase);
    issuer = container.resolve(PrismaClientIssuer);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should complete full order creation with inventory validation", async () => {
    const products = await NftTestHelper.seedProducts({ 
      maxSupply: 10, 
      price: 2000 
    });
    const product = products[0] as ProductWithNftProduct;
    
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: "TOKYO" as any
    }) as UserWithId;

    const ctx: IContext = {
      currentUser: { id: user.id },
      issuer
    } as any;

    const result = await orderUseCase.createOrder(ctx, {
      input: {
        items: [{
          productId: product.id,
          quantity: 3
        }],
        receiverAddress: "addr_test_receiver"
      }
    });

    expect(result.__typename).toBe('OrderCreateSuccess');
    
    if (result.__typename === 'OrderCreateSuccess') {
      expect(result.order.totalAmount).toBe(6000); // 3 * 2000
      expect(result.paymentLink).toBe('https://nmkr.io/pay/test-payment-uid');
      expect(result.customProperty).toContain('orderId');
      
      const productService = container.resolve("ProductService") as ProductService;
      const inventory = await productService.calculateInventory(ctx, product.id);
      expect(inventory.reserved).toBe(3);
      expect(inventory.available).toBe(7);
    }
  });

  it("should handle NMKR API failures gracefully", async () => {
    const products = await NftTestHelper.seedProducts();
    const product = products[0] as ProductWithNftProduct;
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: "TOKYO" as any
    }) as UserWithId;

    const mockNmkrClient = NftTestHelper.createNmkrStub('error');
    container.register("NmkrClient", { useValue: mockNmkrClient });
    
    const ctx: IContext = {
      currentUser: { id: user.id },
      issuer
    } as any;

    const result = await orderUseCase.createOrder(ctx, {
      input: {
        items: [{ productId: product.id, quantity: 1 }],
        receiverAddress: "addr_test_receiver"
      }
    });

    expect(result.__typename).toBe('OrderCreateError');
    if (result.__typename === 'OrderCreateError') {
      expect(result.code).toBe('INTERNAL_ERROR');
    }
  });

  it("should validate product existence and type", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: "TOKYO" as any
    }) as UserWithId;

    const ctx: IContext = {
      currentUser: { id: user.id },
      issuer
    } as any;

    const result = await orderUseCase.createOrder(ctx, {
      input: {
        items: [{ productId: "non-existent-product", quantity: 1 }],
        receiverAddress: "addr_test_receiver"
      }
    });

    expect(result.__typename).toBe('OrderCreateError');
    if (result.__typename === 'OrderCreateError') {
      expect(result.code).toBe('PRODUCT_NOT_FOUND');
    }
  });

  it("should handle insufficient inventory", async () => {
    const products = await NftTestHelper.seedProducts({ maxSupply: 5 });
    const product = products[0] as ProductWithNftProduct;
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: "TOKYO" as any
    }) as UserWithId;

    const ctx: IContext = {
      currentUser: { id: user.id },
      issuer
    } as any;

    const result = await orderUseCase.createOrder(ctx, {
      input: {
        items: [{ productId: product.id, quantity: 10 }], // More than available
        receiverAddress: "addr_test_receiver"
      }
    });

    expect(result.__typename).toBe('OrderCreateError');
    if (result.__typename === 'OrderCreateError') {
      expect(result.code).toBe('INSUFFICIENT_INVENTORY');
    }
  });

  it("should validate input parameters", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: "TOKYO" as any
    }) as UserWithId;

    const ctx: IContext = {
      currentUser: { id: user.id },
      issuer
    } as any;

    const result1 = await orderUseCase.createOrder(ctx, {
      input: {
        items: [],
        receiverAddress: "addr_test_receiver"
      }
    });

    expect(result1.__typename).toBe('OrderCreateError');
    if (result1.__typename === 'OrderCreateError') {
      expect(result1.code).toBe('EMPTY_ORDER');
    }

    const products2 = await NftTestHelper.seedProducts();
    const product2 = products2[0] as ProductWithNftProduct;
    const result2 = await orderUseCase.createOrder(ctx, {
      input: {
        items: [
          { productId: product2.id, quantity: 1 },
          { productId: product2.id, quantity: 1 }
        ],
        receiverAddress: "addr_test_receiver"
      }
    });

    expect(result2.__typename).toBe('OrderCreateError');
    if (result2.__typename === 'OrderCreateError') {
      expect(result2.code).toBe('MULTIPLE_ITEMS_NOT_SUPPORTED');
    }
  });

  it("should handle NMKR timeout scenarios", async () => {
    const products = await NftTestHelper.seedProducts();
    const product = products[0] as ProductWithNftProduct;
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: "TOKYO" as any
    }) as UserWithId;

    const mockNmkrClient = NftTestHelper.createNmkrStub('timeout');
    container.register("NmkrClient", { useValue: mockNmkrClient });
    
    const ctx: IContext = {
      currentUser: { id: user.id },
      issuer
    } as any;

    const result = await orderUseCase.createOrder(ctx, {
      input: {
        items: [{ productId: product.id, quantity: 1 }],
        receiverAddress: "addr_test_receiver"
      }
    });

    expect(result.__typename).toBe('OrderCreateError');
    if (result.__typename === 'OrderCreateError') {
      expect(result.code).toBe('INTERNAL_ERROR');
    }
  });
});
