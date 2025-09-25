import "reflect-metadata";
import { container } from "tsyringe";
import ProductService from "../../../application/domain/product/service";
import { PrismaClientIssuer } from "../../../infrastructure/prisma/client";
import { IProductRepository } from "../../../application/domain/product/data/interface";
import { IOrderItemReadService } from "../../../application/domain/order/orderItem/service";

class MockProductRepository implements IProductRepository {
  findByIdForValidation = jest.fn();
  findManyByIdsForValidation = jest.fn();
}

class MockOrderItemReadService implements IOrderItemReadService {
  getInventoryCounts = jest.fn();
}

describe("P0 Critical: Inventory SUM Aggregation", () => {
  let productService: ProductService;
  let mockProductRepo: MockProductRepository;
  let mockOrderItemReadService: MockOrderItemReadService;
  let issuer: PrismaClientIssuer;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();
    
    mockProductRepo = new MockProductRepository();
    mockOrderItemReadService = new MockOrderItemReadService();
    
    issuer = {
      public: jest.fn().mockImplementation((ctx, callback) => {
        const mockTx = {
          product: {
            findUnique: jest.fn().mockResolvedValue({ maxSupply: 100 })
          }
        };
        return callback(mockTx);
      })
    } as any;
    
    container.register("ProductRepository", { useValue: mockProductRepo });
    container.register("OrderItemReadService", { useValue: mockOrderItemReadService });
    
    productService = container.resolve(ProductService);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should aggregate quantity SUM not count for PENDING orders", async () => {
    const productId = "test-product-id";
    
    issuer.public = jest.fn().mockImplementation((ctx, callback) => {
      const mockTx = {
        product: {
          findUnique: jest.fn().mockResolvedValue({ maxSupply: 100 })
        }
      };
      return callback(mockTx);
    });
    
    mockOrderItemReadService.getInventoryCounts.mockResolvedValue({
      reserved: 8,
      soldPendingMint: 0,
      minted: 0
    });

    const inventory = await productService.calculateInventory(
      { issuer } as any,
      productId
    );

    expect(inventory.reserved).toBe(8);
    expect(inventory.soldPendingMint).toBe(0);
    expect(inventory.minted).toBe(0);
    expect(inventory.available).toBe(92); // 100 - 8
    expect(inventory.maxSupply).toBe(100);
  });

  it("should aggregate quantity SUM for PAID orders awaiting mint", async () => {
    const productId = "test-product-id";
    
    issuer.public = jest.fn().mockImplementation((ctx, callback) => {
      const mockTx = {
        product: {
          findUnique: jest.fn().mockResolvedValue({ maxSupply: 50 })
        }
      };
      return callback(mockTx);
    });
    
    mockOrderItemReadService.getInventoryCounts.mockResolvedValue({
      reserved: 0,
      soldPendingMint: 11,
      minted: 0
    });

    const inventory = await productService.calculateInventory(
      { issuer } as any,
      productId
    );

    expect(inventory.reserved).toBe(0);
    expect(inventory.soldPendingMint).toBe(11);
    expect(inventory.minted).toBe(0);
    expect(inventory.available).toBe(39); // 50 - 11
    expect(inventory.maxSupply).toBe(50);
  });

  it("should count MINTED based on NftMint success records", async () => {
    const productId = "test-product-id";
    
    issuer.public = jest.fn().mockImplementation((ctx, callback) => {
      const mockTx = {
        product: {
          findUnique: jest.fn().mockResolvedValue({ maxSupply: 30 })
        }
      };
      return callback(mockTx);
    });
    
    mockOrderItemReadService.getInventoryCounts.mockResolvedValue({
      reserved: 0,
      soldPendingMint: 0,
      minted: 6
    });

    const inventory = await productService.calculateInventory(
      { issuer } as any,
      productId
    );

    expect(inventory.reserved).toBe(0);
    expect(inventory.soldPendingMint).toBe(0);
    expect(inventory.minted).toBe(6);
    expect(inventory.available).toBe(24); // 30 - 6
    expect(inventory.maxSupply).toBe(30);
  });

  it("should handle products without maxSupply as unlimited", async () => {
    const productId = "test-product-id";
    
    issuer.public = jest.fn().mockImplementation((ctx, callback) => {
      const mockTx = {
        product: {
          findUnique: jest.fn().mockResolvedValue({ maxSupply: null })
        }
      };
      return callback(mockTx);
    });
    
    mockOrderItemReadService.getInventoryCounts.mockResolvedValue({
      reserved: 1000,
      soldPendingMint: 0,
      minted: 0
    });

    const inventory = await productService.calculateInventory(
      { issuer } as any,
      productId
    );

    expect(inventory.reserved).toBe(1000);
    expect(inventory.soldPendingMint).toBe(0);
    expect(inventory.minted).toBe(0);
    expect(inventory.maxSupply).toBeNull();
    expect(inventory.available).toBe(Number.MAX_SAFE_INTEGER);
  });
});
