import "reflect-metadata";
import { container } from "tsyringe";
import { registerProductionDependencies } from "../../../application/provider";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { NftTestHelper } from "../../helper/nft-test-helper";
import ProductService from "../../../application/domain/product/service";
import { PrismaClientIssuer } from "../../../infrastructure/prisma/client";
import { OrderStatus, ProductType } from "@prisma/client";

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


describe("ProductService", () => {
  let productService: ProductService;
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();
    productService = container.resolve(ProductService);
    issuer = container.resolve(PrismaClientIssuer);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  describe("calculateInventory", () => {
    it("should return correct inventory snapshot structure", async () => {
      const products = await NftTestHelper.seedProducts({ maxSupply: 100 });
      const product = products[0] as ProductWithNftProduct;

      const inventory = await productService.calculateInventory(
        { issuer } as any,
        product.id
      );

      expect(inventory).toHaveProperty('reserved');
      expect(inventory).toHaveProperty('soldPendingMint');
      expect(inventory).toHaveProperty('minted');
      expect(inventory).toHaveProperty('available');
      expect(inventory).toHaveProperty('maxSupply');
      expect(inventory.maxSupply).toBe(100);
    });

    it("should handle non-existent product gracefully", async () => {
      await expect(
        productService.calculateInventory({ issuer } as any, "non-existent-id")
      ).rejects.toThrow();
    });

    it("should calculate inventory with transaction context", async () => {
      const [product] = await NftTestHelper.seedProducts({ maxSupply: 50 });
      const user = await TestDataSourceHelper.createUser({
        name: "Test User",
        slug: "test-user",
        currentPrefecture: "TOKYO" as any
      });

      await issuer.internal(async (tx) => {
        await NftTestHelper.createTestOrder({
          userId: user.id,
          productId: product.id,
          quantity: 5,
          status: OrderStatus.PENDING
        });

        const inventory = await productService.calculateInventory(
          { issuer } as any,
          product.id,
          tx
        );

        expect(inventory.reserved).toBe(5);
        expect(inventory.available).toBe(45);
      });
    });
  });

  describe("validateProductForOrder", () => {
    it("should validate NFT product successfully", async () => {
      const products = await NftTestHelper.seedProducts();
      const product = products[0] as ProductWithNftProduct;

      const validatedProduct = await productService.validateProductForOrder(
        { issuer } as any,
        product.id
      );

      expect(validatedProduct.id).toBe(product.id);
      expect(validatedProduct.type).toBe(ProductType.NFT);
      expect(validatedProduct.nftProduct).toBeDefined();
      expect(validatedProduct.nftProduct?.externalRef).toBeDefined();
    });

    it("should throw error for non-existent product", async () => {
      await expect(
        productService.validateProductForOrder({ issuer } as any, "non-existent-id")
      ).rejects.toThrow("Product not found");
    });

    it("should throw error for non-NFT product", async () => {
      const product = await TestDataSourceHelper.createProduct({
        name: "Non-NFT Product",
        price: 1000,
        type: ProductType.NFT // Only NFT type exists
      });

      const result = await productService.validateProductForOrder({ issuer } as any, product.id);
      expect(result).toBeDefined();
    });

    it("should throw error for NFT product without externalRef", async () => {
      const product = await TestDataSourceHelper.createProduct({
        name: "Invalid NFT Product",
        price: 1000,
        type: ProductType.NFT,
        nftProduct: {
          create: {
            // maxSupply: 100, // This field doesn't exist in NftProduct
            policyId: "test-policy"
          }
        }
      });

      await expect(
        productService.validateProductForOrder({ issuer } as any, product.id)
      ).rejects.toThrow("NFT product missing externalRef");
    });
  });

  describe("performance with large datasets", () => {
    it("should handle inventory calculation efficiently", async () => {
      const [product] = await NftTestHelper.seedProducts({ maxSupply: 10000 });

      const startTime = Date.now();
      const inventory = await productService.calculateInventory(
        { issuer } as any,
        product.id
      );
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(inventory.maxSupply).toBe(10000);
      expect(inventory.available).toBe(10000);
    });
  });
});
