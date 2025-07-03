import { container } from "tsyringe";
import NFTWalletService from "@/application/domain/account/nft-wallet/service";
import { IContext } from "@/types/server";

class MockPrismaClientIssuer {
  internal = jest.fn();
  public = jest.fn();
  onlyBelongingCommunity = jest.fn();
  admin = jest.fn();
}

describe("NFTWalletService", () => {
  let service: NFTWalletService;
  let mockPrismaClient: MockPrismaClientIssuer;
  let mockCtx: IContext;

  beforeEach(() => {
    mockPrismaClient = new MockPrismaClientIssuer();
    container.registerInstance("PrismaClientIssuer", mockPrismaClient);
    service = container.resolve(NFTWalletService);

    mockCtx = {
      issuer: mockPrismaClient as any,
      communityId: "community-123",
      uid: "user-123",
    } as IContext;

    jest.clearAllMocks();
  });

  afterEach(() => {
    container.clearInstances();
    jest.restoreAllMocks();
  });

  describe("createOrUpdateWalletAddress", () => {
    const userId = "user-123";
    const walletAddress = "0x1234567890abcdef1234567890abcdef12345678";

    it("should create or update wallet address with transaction client", async () => {
      const mockTx = { nftWallet: { upsert: jest.fn() } };
      const mockResult = {
        id: "wallet-123",
        userId,
        walletAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTx.nftWallet.upsert.mockResolvedValue(mockResult);

      const result = await service.createOrUpdateWalletAddress(mockCtx, userId, walletAddress, mockTx as any);

      expect(mockTx.nftWallet.upsert).toHaveBeenCalledWith({
        where: { userId },
        update: { walletAddress },
        create: { userId, walletAddress },
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle empty wallet address", async () => {
      const mockTx = { nftWallet: { upsert: jest.fn() } };
      const emptyAddress = "";
      const mockResult = {
        id: "wallet-123",
        userId,
        walletAddress: emptyAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTx.nftWallet.upsert.mockResolvedValue(mockResult);

      const result = await service.createOrUpdateWalletAddress(mockCtx, userId, emptyAddress, mockTx as any);

      expect(mockTx.nftWallet.upsert).toHaveBeenCalledWith({
        where: { userId },
        update: { walletAddress: emptyAddress },
        create: { userId, walletAddress: emptyAddress },
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle very long wallet address", async () => {
      const mockTx = { nftWallet: { upsert: jest.fn() } };
      const longAddress = "0x" + "a".repeat(100);
      const mockResult = {
        id: "wallet-123",
        userId,
        walletAddress: longAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTx.nftWallet.upsert.mockResolvedValue(mockResult);

      const result = await service.createOrUpdateWalletAddress(mockCtx, userId, longAddress, mockTx as any);

      expect(mockTx.nftWallet.upsert).toHaveBeenCalledWith({
        where: { userId },
        update: { walletAddress: longAddress },
        create: { userId, walletAddress: longAddress },
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle wallet address with special characters", async () => {
      const mockTx = { nftWallet: { upsert: jest.fn() } };
      const specialAddress = "0x!@#$%^&*()_+-=[]{}|;:,.<>?";
      const mockResult = {
        id: "wallet-123",
        userId,
        walletAddress: specialAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTx.nftWallet.upsert.mockResolvedValue(mockResult);

      const result = await service.createOrUpdateWalletAddress(mockCtx, userId, specialAddress, mockTx as any);

      expect(mockTx.nftWallet.upsert).toHaveBeenCalledWith({
        where: { userId },
        update: { walletAddress: specialAddress },
        create: { userId, walletAddress: specialAddress },
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle empty user ID", async () => {
      const mockTx = { nftWallet: { upsert: jest.fn() } };
      const emptyUserId = "";
      const mockResult = {
        id: "wallet-123",
        userId: emptyUserId,
        walletAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTx.nftWallet.upsert.mockResolvedValue(mockResult);

      const result = await service.createOrUpdateWalletAddress(mockCtx, emptyUserId, walletAddress, mockTx as any);

      expect(mockTx.nftWallet.upsert).toHaveBeenCalledWith({
        where: { userId: emptyUserId },
        update: { walletAddress },
        create: { userId: emptyUserId, walletAddress },
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle database errors", async () => {
      const mockTx = { nftWallet: { upsert: jest.fn() } };
      const error = new Error("Database connection failed");
      mockTx.nftWallet.upsert.mockRejectedValue(error);

      await expect(service.createOrUpdateWalletAddress(mockCtx, userId, walletAddress, mockTx as any)).rejects.toThrow(
        "Database connection failed"
      );
    });

    it("should handle transaction client database errors", async () => {
      const mockTx = { nftWallet: { upsert: jest.fn() } };
      const error = new Error("Transaction failed");
      mockTx.nftWallet.upsert.mockRejectedValue(error);

      await expect(service.createOrUpdateWalletAddress(mockCtx, userId, walletAddress, mockTx as any)).rejects.toThrow(
        "Transaction failed"
      );
    });
  });

  describe("findWalletByUserId", () => {
    const userId = "user-123";

    it("should find wallet by user ID with transaction client", async () => {
      const mockTx = { nftWallet: { findUnique: jest.fn() } };
      const mockWallet = {
        id: "wallet-123",
        userId,
        walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTx.nftWallet.findUnique.mockResolvedValue(mockWallet);

      const result = await service.findWalletByUserId(mockCtx, userId, mockTx as any);

      expect(mockTx.nftWallet.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual(mockWallet);
    });

    it("should return null when wallet is not found with transaction client", async () => {
      const mockTx = { nftWallet: { findUnique: jest.fn() } };
      mockTx.nftWallet.findUnique.mockResolvedValue(null);

      const result = await service.findWalletByUserId(mockCtx, userId, mockTx as any);

      expect(mockTx.nftWallet.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toBeNull();
    });

    it("should handle empty user ID with transaction client", async () => {
      const mockTx = { nftWallet: { findUnique: jest.fn() } };
      const emptyUserId = "";
      mockTx.nftWallet.findUnique.mockResolvedValue(null);

      const result = await service.findWalletByUserId(mockCtx, emptyUserId, mockTx as any);

      expect(mockTx.nftWallet.findUnique).toHaveBeenCalledWith({
        where: { userId: emptyUserId },
      });
      expect(result).toBeNull();
    });

    it("should handle null user ID with transaction client", async () => {
      const mockTx = { nftWallet: { findUnique: jest.fn() } };
      const nullUserId = null as any;
      mockTx.nftWallet.findUnique.mockResolvedValue(null);

      const result = await service.findWalletByUserId(mockCtx, nullUserId, mockTx as any);

      expect(mockTx.nftWallet.findUnique).toHaveBeenCalledWith({
        where: { userId: nullUserId },
      });
      expect(result).toBeNull();
    });

    it("should handle undefined user ID with transaction client", async () => {
      const mockTx = { nftWallet: { findUnique: jest.fn() } };
      const undefinedUserId = undefined as any;
      mockTx.nftWallet.findUnique.mockResolvedValue(null);

      const result = await service.findWalletByUserId(mockCtx, undefinedUserId, mockTx as any);

      expect(mockTx.nftWallet.findUnique).toHaveBeenCalledWith({
        where: { userId: undefinedUserId },
      });
      expect(result).toBeNull();
    });

    it("should handle transaction client database errors", async () => {
      const mockTx = { nftWallet: { findUnique: jest.fn() } };
      const error = new Error("Transaction query failed");
      mockTx.nftWallet.findUnique.mockRejectedValue(error);

      await expect(service.findWalletByUserId(mockCtx, userId, mockTx as any)).rejects.toThrow(
        "Transaction query failed"
      );
    });
  });
});
