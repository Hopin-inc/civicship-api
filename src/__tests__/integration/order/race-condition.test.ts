import "reflect-metadata";
import { container } from "tsyringe";
import { registerProductionDependencies } from "../../../application/provider";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { NftTestHelper } from "../../helper/nft-test-helper";
import OrderUseCase from "../../../application/domain/order/usecase";
import { PrismaClientIssuer } from "../../../infrastructure/prisma/client";
import { IContext } from "../../../types/server";
import ProductService from "../../../application/domain/product/service";


describe("P0 Critical: Race Condition Prevention", () => {
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

  it("should prevent overselling with concurrent order creation", async () => {
    const [product] = await NftTestHelper.seedProducts({ maxSupply: 5 });
    
    const users: any[] = [];
    for (let i = 0; i < 3; i++) {
      const user = await TestDataSourceHelper.createUser({
        name: `User ${i + 1}`,
        slug: `user-${i + 1}`,
        currentPrefecture: "TOKYO" as any
      });
      users.push(user);
    }

    const orderPromises = users.map(user => {
      const ctx: IContext = {
        currentUser: { id: user.id },
        issuer
      } as any;
      
      return orderUseCase.createOrder(ctx, {
        input: {
          items: [{
            productId: product.id,
            quantity: 3 // Each wants 3, total would be 9 > 5 supply
          }],
          receiverAddress: `addr_test_${user.id}`
        }
      });
    });

    const results = await Promise.allSettled(orderPromises);
    
    const successfulOrders = results.filter(
      result => result.status === 'fulfilled' && 
      result.value.__typename === 'OrderCreateSuccess'
    );
    
    const failedOrders = results.filter(
      result => result.status === 'fulfilled' && 
      result.value.__typename === 'OrderCreateError'
    );

    expect(successfulOrders).toHaveLength(1);
    expect(failedOrders).toHaveLength(2);
    
    const productService = container.resolve<ProductService>(ProductService);
    const finalInventory = await productService.calculateInventory({ issuer } as any, product.id);
    expect(finalInventory.available).toBe(2); // 5 - 3 = 2
  });

  it("should handle race condition with inventory re-verification", async () => {
    const [product] = await NftTestHelper.seedProducts({ maxSupply: 1 });
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: "TOKYO" as any
    });

    const ctx: IContext = {
      currentUser: { id: user.id },
      issuer
    } as any;

    const [result1, result2] = await Promise.allSettled([
      orderUseCase.createOrder(ctx, {
        input: {
          items: [{ productId: product.id, quantity: 1 }],
          receiverAddress: "addr_test_1"
        }
      }),
      orderUseCase.createOrder(ctx, {
        input: {
          items: [{ productId: product.id, quantity: 1 }],
          receiverAddress: "addr_test_2"
        }
      })
    ]);

    const outcomes = [result1, result2].map(r => 
      r.status === 'fulfilled' ? r.value.__typename : 'rejected'
    );
    
    expect(outcomes).toContain('OrderCreateSuccess');
    expect(outcomes).toContain('OrderCreateError');
  });

  it("should handle multiple concurrent orders with varying quantities", async () => {
    const [product] = await NftTestHelper.seedProducts({ maxSupply: 10 });
    
    const users: any[] = [];
    for (let i = 0; i < 5; i++) {
      const user = await TestDataSourceHelper.createUser({
        name: `User ${i + 1}`,
        slug: `user-${i + 1}`,
        currentPrefecture: "TOKYO" as any
      });
      users.push(user);
    }

    const orderPromises = users.map((user, index) => {
      const ctx: IContext = {
        currentUser: { id: user.id },
        issuer
      } as any;
      
      return orderUseCase.createOrder(ctx, {
        input: {
          items: [{
            productId: product.id,
            quantity: index + 1 // 1, 2, 3, 4, 5 quantities
          }],
          receiverAddress: `addr_test_${user.id}`
        }
      });
    });

    const results = await Promise.allSettled(orderPromises);
    
    const successfulOrders = results.filter(
      result => result.status === 'fulfilled' && 
      result.value.__typename === 'OrderCreateSuccess'
    );

    let totalQuantity = 0;
    successfulOrders.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.__typename === 'OrderCreateSuccess') {
        const userIndex = results.indexOf(result);
        totalQuantity += userIndex + 1;
      }
    });

    expect(totalQuantity).toBeLessThanOrEqual(10);
    
    const productService = container.resolve<ProductService>(ProductService);
    const finalInventory = await productService.calculateInventory({ issuer } as any, product.id);
    expect(finalInventory.available).toBe(10 - totalQuantity);
  });
});
