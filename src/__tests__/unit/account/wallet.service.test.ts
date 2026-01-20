import "reflect-metadata";
import { Prisma, WalletType } from "@prisma/client";
import { container } from "tsyringe";
import WalletService from "@/application/domain/account/wallet/service";
import { InsufficientBalanceError, NotFoundError, ValidationError } from "@/errors/graphql";
import { IContext } from "@/types/server";
import { IWalletRepository } from "@/application/domain/account/wallet/data/interface";
import WalletConverter from "@/application/domain/account/wallet/data/converter";

export class MockWalletRepository implements IWalletRepository {
  query = jest.fn();
  find = jest.fn();
  findCommunityWallet = jest.fn();
  findFirstExistingMemberWallet = jest.fn();
  create = jest.fn();
  delete = jest.fn();
  calculateCurrentBalance = jest.fn();
}

export class MockWalletConverter extends WalletConverter {
  filter = jest.fn();
  sort = jest.fn();
  createCommunityWallet = jest.fn();
  createMemberWallet = jest.fn();
}

describe("WalletService", () => {
  let mockRepository: MockWalletRepository;
  let mockConverter: MockWalletConverter;
  let walletService: WalletService;

  const mockCtx = {
    issuer: { public: jest.fn((ctx, callback) => callback({})) },
  } as unknown as IContext;
  const mockTx = {} as Prisma.TransactionClient;
  const walletId = "wallet-123";
  const communityId = "community-456";
  const userId = "user-789";

  const baseWallet = {
    id: walletId,
    communityId,
    userId,
    createdAt: new Date("2024-01-01"),
    updatedAt: null,
  };

  const memberWallet = { ...baseWallet, id: "member-wallet-111", type: WalletType.MEMBER };
  const communityWallet = {
    ...baseWallet,
    id: "community-wallet-111",
    type: WalletType.COMMUNITY,
    userId: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockRepository = new MockWalletRepository();
    mockConverter = new MockWalletConverter();

    container.register("WalletRepository", { useValue: mockRepository });
    container.register("WalletConverter", { useValue: mockConverter });
    container.register("TransactionService", { useValue: { refreshCurrentPoint: jest.fn() } });

    walletService = container.resolve(WalletService);
  });

  describe("fetchWallets", () => {
    it("should return all wallets", async () => {
      mockRepository.query.mockResolvedValue([memberWallet, communityWallet]);
      mockConverter.filter.mockReturnValue({});
      mockConverter.sort.mockReturnValue({});

      const result = await walletService.fetchWallets(
        mockCtx,
        { filter: {}, sort: {}, cursor: undefined },
        10,
      );

      expect(mockRepository.query).toHaveBeenCalledWith(mockCtx, {}, {}, 10, undefined);
      expect(result).toEqual([memberWallet, communityWallet]);
    });
  });

  describe("findWallet", () => {
    it("should return the wallet if found", async () => {
      mockRepository.find.mockResolvedValue(baseWallet);

      const result = await walletService.findWallet(mockCtx, walletId);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, walletId);
      expect(result).toEqual(baseWallet);
    });

    it("should return null if not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      const result = await walletService.findWallet(mockCtx, walletId);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, walletId);
      expect(result).toBeNull();
    });
  });

  describe("findMemberWalletOrThrow", () => {
    it("should return the member wallet if found", async () => {
      mockRepository.findFirstExistingMemberWallet.mockResolvedValue(memberWallet);

      const result = await walletService.findMemberWalletOrThrow(mockCtx, userId, communityId);

      expect(mockRepository.findFirstExistingMemberWallet).toHaveBeenCalledWith(
        mockCtx,
        communityId,
        userId,
        undefined,
      );
      expect(result).toEqual(memberWallet);
    });

    it("should throw NotFoundError if wallet does not exist", async () => {
      mockRepository.findFirstExistingMemberWallet.mockResolvedValue(null);

      await expect(
        walletService.findMemberWalletOrThrow(mockCtx, userId, communityId),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("findCommunityWalletOrThrow", () => {
    it("should return the community wallet if found", async () => {
      mockRepository.findCommunityWallet.mockResolvedValue(communityWallet);

      const result = await walletService.findCommunityWalletOrThrow(mockCtx, communityId);

      expect(mockRepository.findCommunityWallet).toHaveBeenCalledWith(mockCtx, communityId, undefined);
      expect(result).toEqual(communityWallet);
    });

    it("should throw NotFoundError if no community wallet is found", async () => {
      mockRepository.findCommunityWallet.mockResolvedValue(null);

      await expect(walletService.findCommunityWalletOrThrow(mockCtx, communityId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("checkIfMemberWalletExists", () => {
    it("should return the wallet if found", async () => {
      mockRepository.find.mockResolvedValue(memberWallet);

      const result = await walletService.checkIfMemberWalletExists(mockCtx, walletId);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, walletId);
      expect(result).toEqual(memberWallet);
    });

    it("should throw NotFoundError if wallet does not exist", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(walletService.checkIfMemberWalletExists(mockCtx, walletId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("createCommunityWallet", () => {
    it("should create a community wallet", async () => {
      const createInput = {
        type: WalletType.COMMUNITY,
        community: { connect: { id: communityId } },
      };
      mockConverter.createCommunityWallet.mockReturnValue(createInput);
      mockRepository.create.mockResolvedValue(communityWallet);

      const result = await walletService.createCommunityWallet(mockCtx, communityId, mockTx);

      expect(mockConverter.createCommunityWallet).toHaveBeenCalledWith({ communityId });
      expect(mockRepository.create).toHaveBeenCalledWith(mockCtx, createInput, mockTx);
      expect(result).toEqual(communityWallet);
    });
  });

  describe("createMemberWalletIfNeeded", () => {
    it("should return existing member wallet if exists", async () => {
      mockRepository.findFirstExistingMemberWallet.mockResolvedValue(memberWallet);

      const result = await walletService.createMemberWalletIfNeeded(
        mockCtx,
        userId,
        communityId,
        mockTx,
      );

      expect(mockRepository.findFirstExistingMemberWallet).toHaveBeenCalledWith(
        mockCtx,
        communityId,
        userId,
        mockTx,
      );
      expect(result).toEqual(memberWallet);
    });

    it("should create new member wallet if not exists", async () => {
      const createInput = {
        type: WalletType.MEMBER,
        community: { connect: { id: communityId } },
        user: { connect: { id: userId } },
      };
      mockRepository.findFirstExistingMemberWallet.mockResolvedValue(null);
      mockConverter.createMemberWallet.mockReturnValue(createInput);
      mockRepository.create.mockResolvedValue(memberWallet);

      const result = await walletService.createMemberWalletIfNeeded(
        mockCtx,
        userId,
        communityId,
        mockTx,
      );

      expect(mockConverter.createMemberWallet).toHaveBeenCalledWith({ userId, communityId });
      expect(mockRepository.create).toHaveBeenCalledWith(mockCtx, createInput, mockTx);
      expect(result).toEqual(memberWallet);
    });
  });

  describe("deleteMemberWallet", () => {
    it("should delete the member wallet", async () => {
      mockRepository.findFirstExistingMemberWallet.mockResolvedValue(memberWallet);
      mockRepository.delete.mockResolvedValue(memberWallet);

      const result = await walletService.deleteMemberWallet(mockCtx, userId, communityId, mockTx);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockCtx, memberWallet.id, mockTx);
      expect(result).toEqual(memberWallet);
    });
  });

  describe("refreshCurrentPointViewIfNotExist error handling", () => {
    it("should handle ctx.issuer.public() failure gracefully", async () => {
      const walletWithNullView = {
        id: "wallet-1",
        currentPointView: null
      } as any;

      const issuerError = new Error("Issuer service unavailable");
      (mockCtx.issuer.public as jest.Mock).mockRejectedValue(issuerError);

      mockRepository.findFirstExistingMemberWallet.mockResolvedValue(walletWithNullView);

      await expect(
        walletService.findMemberWalletOrThrow(mockCtx, "user-1", "community-1")
      ).rejects.toThrow("Issuer service unavailable");
    });

    it("should handle ctx.issuer.public() with transaction callback error", async () => {
      const walletWithNullView = {
        id: "wallet-1", 
        currentPointView: null
      } as any;

      const mockTransactionService = container.resolve("TransactionService") as any;
      mockTransactionService.refreshCurrentPoint.mockRejectedValue(
        new Error("Transaction refresh failed")
      );

      (mockCtx.issuer.public as jest.Mock).mockImplementation(async (ctx, callback) => {
        return await callback({});
      });

      mockRepository.findFirstExistingMemberWallet.mockResolvedValue(walletWithNullView);

      await expect(
        walletService.findMemberWalletOrThrow(mockCtx, "user-1", "community-1")
      ).rejects.toThrow("Transaction refresh failed");
    });

    it("should not call issuer.public when currentPointView exists", async () => {
      const walletWithView = {
        id: "wallet-1",
        currentPointView: { currentPoint: BigInt(1000) }
      } as any;

      mockRepository.findFirstExistingMemberWallet.mockResolvedValue(walletWithView);

      const result = await walletService.findMemberWalletOrThrow(mockCtx, "user-1", "community-1");

      expect(mockCtx.issuer.public).not.toHaveBeenCalled();
      expect(result).toBe(walletWithView);
    });

    it("should handle retry logic when refresh succeeds", async () => {
      const walletWithNullView = {
        id: "wallet-1",
        currentPointView: null
      } as any;

      const walletWithView = {
        id: "wallet-1", 
        currentPointView: { currentPoint: BigInt(1000) }
      } as any;

      mockRepository.findFirstExistingMemberWallet
        .mockResolvedValueOnce(walletWithNullView)
        .mockResolvedValueOnce(walletWithView);

      (mockCtx.issuer.public as jest.Mock).mockResolvedValue(undefined);
      const mockTransactionService = container.resolve("TransactionService") as any;
      mockTransactionService.refreshCurrentPoint.mockResolvedValue(undefined);

      const result = await walletService.findMemberWalletOrThrow(mockCtx, "user-1", "community-1");

      expect(mockRepository.findFirstExistingMemberWallet).toHaveBeenCalledTimes(2);
      expect(result).toBe(walletWithView);
    });

    it("should handle edge case where wallet becomes null after refresh", async () => {
      const walletWithNullView = {
        id: "wallet-1",
        currentPointView: null
      } as any;

      mockRepository.findFirstExistingMemberWallet
        .mockResolvedValueOnce(walletWithNullView)
        .mockResolvedValueOnce(null);

      (mockCtx.issuer.public as jest.Mock).mockResolvedValue(undefined);
      const mockTransactionService = container.resolve("TransactionService") as any;
      mockTransactionService.refreshCurrentPoint.mockResolvedValue(undefined);

      await expect(
        walletService.findMemberWalletOrThrow(mockCtx, "user-1", "community-1")
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("checkCommunityWalletBalanceInTransaction", () => {
    it("should pass when balance is sufficient", async () => {
      const requiredAmount = 1000;
      const currentBalance = BigInt(5000);

      mockRepository.findCommunityWallet.mockResolvedValue(communityWallet);
      mockRepository.calculateCurrentBalance.mockResolvedValue(currentBalance);

      await expect(
        walletService.checkCommunityWalletBalanceInTransaction(
          mockCtx,
          communityId,
          requiredAmount,
          mockTx,
        ),
      ).resolves.not.toThrow();

      expect(mockRepository.findCommunityWallet).toHaveBeenCalledWith(mockCtx, communityId, mockTx);
      expect(mockRepository.calculateCurrentBalance).toHaveBeenCalledWith(communityWallet.id, mockTx);
    });

    it("should throw InsufficientBalanceError when balance is insufficient", async () => {
      const requiredAmount = 5000;
      const currentBalance = BigInt(1000);

      mockRepository.findCommunityWallet.mockResolvedValue(communityWallet);
      mockRepository.calculateCurrentBalance.mockResolvedValue(currentBalance);

      await expect(
        walletService.checkCommunityWalletBalanceInTransaction(
          mockCtx,
          communityId,
          requiredAmount,
          mockTx,
        ),
      ).rejects.toThrow(InsufficientBalanceError);
    });

    it("should throw NotFoundError when community wallet does not exist", async () => {
      mockRepository.findCommunityWallet.mockResolvedValue(null);

      await expect(
        walletService.checkCommunityWalletBalanceInTransaction(mockCtx, communityId, 1000, mockTx),
      ).rejects.toThrow(NotFoundError);

      expect(mockRepository.calculateCurrentBalance).not.toHaveBeenCalled();
    });

    it("should throw ValidationError when requiredAmount is not a safe integer", async () => {
      const unsafeInteger = Number.MAX_SAFE_INTEGER + 1;

      await expect(
        walletService.checkCommunityWalletBalanceInTransaction(
          mockCtx,
          communityId,
          unsafeInteger,
          mockTx,
        ),
      ).rejects.toThrow(ValidationError);

      expect(mockRepository.findCommunityWallet).not.toHaveBeenCalled();
    });

    it("should throw ValidationError when requiredAmount is negative", async () => {
      await expect(
        walletService.checkCommunityWalletBalanceInTransaction(mockCtx, communityId, -100, mockTx),
      ).rejects.toThrow(ValidationError);

      expect(mockRepository.findCommunityWallet).not.toHaveBeenCalled();
    });

    it("should handle exact balance match (boundary case)", async () => {
      const requiredAmount = 1000;
      const currentBalance = BigInt(1000);

      mockRepository.findCommunityWallet.mockResolvedValue(communityWallet);
      mockRepository.calculateCurrentBalance.mockResolvedValue(currentBalance);

      await expect(
        walletService.checkCommunityWalletBalanceInTransaction(
          mockCtx,
          communityId,
          requiredAmount,
          mockTx,
        ),
      ).resolves.not.toThrow();
    });

    it("should handle zero balance case", async () => {
      const requiredAmount = 100;
      const currentBalance = BigInt(0);

      mockRepository.findCommunityWallet.mockResolvedValue(communityWallet);
      mockRepository.calculateCurrentBalance.mockResolvedValue(currentBalance);

      await expect(
        walletService.checkCommunityWalletBalanceInTransaction(
          mockCtx,
          communityId,
          requiredAmount,
          mockTx,
        ),
      ).rejects.toThrow(InsufficientBalanceError);
    });

    it("should handle large BigInt values", async () => {
      const requiredAmount = Number.MAX_SAFE_INTEGER - 1; // Safe integer
      const currentBalance = BigInt(Number.MAX_SAFE_INTEGER);

      mockRepository.findCommunityWallet.mockResolvedValue(communityWallet);
      mockRepository.calculateCurrentBalance.mockResolvedValue(currentBalance);

      await expect(
        walletService.checkCommunityWalletBalanceInTransaction(
          mockCtx,
          communityId,
          requiredAmount,
          mockTx,
        ),
      ).resolves.not.toThrow();
    });
  });


  afterEach(() => {
    jest.restoreAllMocks();
  });
});
