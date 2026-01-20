import "reflect-metadata";
import { Prisma } from "@prisma/client";
import { container } from "tsyringe";
import IncentiveGrantService from "@/application/domain/transaction/incentiveGrant/service";
import { InsufficientBalanceError, NotFoundError } from "@/errors/graphql";
import { IContext } from "@/types/server";
import { IIncentiveGrantRepository } from "@/application/domain/transaction/incentiveGrant/data/interface";
import IncentiveGrantConverter from "@/application/domain/transaction/incentiveGrant/data/converter";
import { ITransactionService } from "@/application/domain/transaction/data/interface";

// Enum values (since Prisma types may not be available)
const IncentiveGrantType = { SIGNUP: "SIGNUP" } as const;
const IncentiveGrantFailureCode = {
  INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS",
  WALLET_NOT_FOUND: "WALLET_NOT_FOUND",
  DATABASE_ERROR: "DATABASE_ERROR",
  UNKNOWN: "UNKNOWN",
} as const;

// Mock Repository
class MockIncentiveGrantRepository implements IIncentiveGrantRepository {
  create = jest.fn();
  markAsCompleted = jest.fn();
  markAsFailed = jest.fn();
}

// Mock Services
class MockSignupBonusConfigService {
  get = jest.fn();
}

class MockWalletService {
  checkCommunityWalletBalanceInTransaction = jest.fn();
  findCommunityWalletOrThrow = jest.fn();
  findMemberWalletOrThrow = jest.fn();
}

class MockTransactionService implements Partial<ITransactionService> {
  grantSignupBonus = jest.fn();
}

describe("IncentiveGrantService", () => {
  let mockRepository: MockIncentiveGrantRepository;
  let mockConverter: IncentiveGrantConverter;
  let mockConfigService: MockSignupBonusConfigService;
  let mockWalletService: MockWalletService;
  let mockTransactionService: MockTransactionService;
  let service: IncentiveGrantService;

  const mockCtx = {} as IContext;
  const mockTx = {} as Prisma.TransactionClient;
  const userId = "user-123";
  const communityId = "community-456";
  const sourceId = `${userId}_${communityId}`;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockRepository = new MockIncentiveGrantRepository();
    mockConverter = new IncentiveGrantConverter();
    mockConfigService = new MockSignupBonusConfigService();
    mockWalletService = new MockWalletService();
    mockTransactionService = new MockTransactionService();

    container.register("IncentiveGrantRepository", { useValue: mockRepository });
    container.register("IncentiveGrantConverter", { useValue: mockConverter });
    container.register("CommunitySignupBonusConfigService", { useValue: mockConfigService });
    container.register("WalletService", { useValue: mockWalletService });
    container.register("TransactionService", { useValue: mockTransactionService });

    service = container.resolve(IncentiveGrantService);
  });

  describe("grantSignupBonusIfEnabled", () => {
    it("should skip when signup bonus is disabled", async () => {
      mockConfigService.get.mockResolvedValue(null);

      const result = await service.grantSignupBonusIfEnabled(
        mockCtx,
        userId,
        communityId,
        sourceId,
        mockTx,
      );

      expect(result).toEqual({ granted: false, transaction: null });
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should skip when signup bonus is not enabled", async () => {
      mockConfigService.get.mockResolvedValue({ isEnabled: false, bonusPoint: 100 });

      const result = await service.grantSignupBonusIfEnabled(
        mockCtx,
        userId,
        communityId,
        sourceId,
        mockTx,
      );

      expect(result).toEqual({ granted: false, transaction: null });
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should skip when already granted (P2002 error)", async () => {
      mockConfigService.get.mockResolvedValue({ isEnabled: true, bonusPoint: 100 });
      const p2002Error = new Error("Unique constraint violation");
      (p2002Error as any).code = "P2002";
      mockRepository.create.mockRejectedValue(p2002Error);

      const result = await service.grantSignupBonusIfEnabled(
        mockCtx,
        userId,
        communityId,
        sourceId,
        mockTx,
      );

      expect(result).toEqual({ granted: false, transaction: null });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockWalletService.checkCommunityWalletBalanceInTransaction).not.toHaveBeenCalled();
    });

    it("should grant signup bonus successfully", async () => {
      const bonusPoint = 100;
      const config = { isEnabled: true, bonusPoint, message: "Welcome!" };
      const communityWallet = { id: "community-wallet-1" };
      const memberWallet = { id: "member-wallet-1" };
      const transaction = {
        id: "transaction-1",
        toPointChange: bonusPoint,
        comment: "Welcome!",
      };

      mockConfigService.get.mockResolvedValue(config);
      mockRepository.create.mockResolvedValue({});
      mockWalletService.checkCommunityWalletBalanceInTransaction.mockResolvedValue(undefined);
      mockWalletService.findCommunityWalletOrThrow.mockResolvedValue(communityWallet);
      mockWalletService.findMemberWalletOrThrow.mockResolvedValue(memberWallet);
      mockTransactionService.grantSignupBonus.mockResolvedValue(transaction);
      mockRepository.markAsCompleted.mockResolvedValue(undefined);

      const result = await service.grantSignupBonusIfEnabled(
        mockCtx,
        userId,
        communityId,
        sourceId,
        mockTx,
      );

      expect(result).toEqual({
        granted: true,
        transaction: {
          id: transaction.id,
          toPointChange: transaction.toPointChange,
          comment: transaction.comment,
        },
      });

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockWalletService.checkCommunityWalletBalanceInTransaction).toHaveBeenCalledWith(
        mockCtx,
        communityId,
        bonusPoint,
        mockTx,
      );
      expect(mockTransactionService.grantSignupBonus).toHaveBeenCalledWith(
        mockCtx,
        bonusPoint,
        communityWallet.id,
        memberWallet.id,
        userId,
        mockTx,
        config.message,
      );
      expect(mockRepository.markAsCompleted).toHaveBeenCalledWith(
        mockCtx,
        userId,
        communityId,
        IncentiveGrantType.SIGNUP,
        sourceId,
        transaction.id,
        mockTx,
      );
    });

    it("should handle insufficient balance error and mark as failed", async () => {
      const bonusPoint = 100;
      const config = { isEnabled: true, bonusPoint, message: null };
      const error = new InsufficientBalanceError("100", 200);

      mockConfigService.get.mockResolvedValue(config);
      mockRepository.create.mockResolvedValue({});
      mockWalletService.checkCommunityWalletBalanceInTransaction.mockRejectedValue(error);
      mockRepository.markAsFailed.mockResolvedValue(undefined);

      const result = await service.grantSignupBonusIfEnabled(
        mockCtx,
        userId,
        communityId,
        sourceId,
        mockTx,
      );

      expect(result).toEqual({ granted: false, transaction: null });
      expect(mockRepository.markAsFailed).toHaveBeenCalledWith(
        mockCtx,
        userId,
        communityId,
        IncentiveGrantType.SIGNUP,
        sourceId,
        IncentiveGrantFailureCode.INSUFFICIENT_FUNDS,
        error.message,
        mockTx,
      );
    });

    it("should handle wallet not found error and mark as failed", async () => {
      const bonusPoint = 100;
      const config = { isEnabled: true, bonusPoint, message: null };
      const error = new NotFoundError("Wallet", { id: "wallet-1" });

      mockConfigService.get.mockResolvedValue(config);
      mockRepository.create.mockResolvedValue({});
      mockWalletService.checkCommunityWalletBalanceInTransaction.mockResolvedValue(undefined);
      mockWalletService.findCommunityWalletOrThrow.mockRejectedValue(error);
      mockRepository.markAsFailed.mockResolvedValue(undefined);

      const result = await service.grantSignupBonusIfEnabled(
        mockCtx,
        userId,
        communityId,
        sourceId,
        mockTx,
      );

      expect(result).toEqual({ granted: false, transaction: null });
      expect(mockRepository.markAsFailed).toHaveBeenCalledWith(
        mockCtx,
        userId,
        communityId,
        IncentiveGrantType.SIGNUP,
        sourceId,
        IncentiveGrantFailureCode.WALLET_NOT_FOUND,
        error.message,
        mockTx,
      );
    });

    it("should handle database error and mark as failed", async () => {
      const bonusPoint = 100;
      const config = { isEnabled: true, bonusPoint, message: null };
      const error = new Error("Database error");
      (error as any).code = "P2025";

      mockConfigService.get.mockResolvedValue(config);
      mockRepository.create.mockResolvedValue({});
      mockWalletService.checkCommunityWalletBalanceInTransaction.mockResolvedValue(undefined);
      mockWalletService.findCommunityWalletOrThrow.mockRejectedValue(error);
      mockRepository.markAsFailed.mockResolvedValue(undefined);

      const result = await service.grantSignupBonusIfEnabled(
        mockCtx,
        userId,
        communityId,
        sourceId,
        mockTx,
      );

      expect(result).toEqual({ granted: false, transaction: null });
      expect(mockRepository.markAsFailed).toHaveBeenCalledWith(
        mockCtx,
        userId,
        communityId,
        IncentiveGrantType.SIGNUP,
        sourceId,
        IncentiveGrantFailureCode.DATABASE_ERROR,
        error.message,
        mockTx,
      );
    });

    it("should handle unknown error and mark as failed", async () => {
      const bonusPoint = 100;
      const config = { isEnabled: true, bonusPoint, message: null };
      const error = new Error("Unknown error");

      mockConfigService.get.mockResolvedValue(config);
      mockRepository.create.mockResolvedValue({});
      mockWalletService.checkCommunityWalletBalanceInTransaction.mockResolvedValue(undefined);
      mockWalletService.findCommunityWalletOrThrow.mockRejectedValue(error);
      mockRepository.markAsFailed.mockResolvedValue(undefined);

      const result = await service.grantSignupBonusIfEnabled(
        mockCtx,
        userId,
        communityId,
        sourceId,
        mockTx,
      );

      expect(result).toEqual({ granted: false, transaction: null });
      expect(mockRepository.markAsFailed).toHaveBeenCalledWith(
        mockCtx,
        userId,
        communityId,
        IncentiveGrantType.SIGNUP,
        sourceId,
        IncentiveGrantFailureCode.UNKNOWN,
        error.message,
        mockTx,
      );
    });

    it("should not mark as failed if grant record was not created", async () => {
      const error = new Error("Config fetch failed");

      mockConfigService.get.mockRejectedValue(error);
      mockRepository.markAsFailed.mockResolvedValue(undefined);

      const result = await service.grantSignupBonusIfEnabled(
        mockCtx,
        userId,
        communityId,
        sourceId,
        mockTx,
      );

      expect(result).toEqual({ granted: false, transaction: null });
      expect(mockRepository.markAsFailed).not.toHaveBeenCalled();
    });

    it("should handle markAsFailed error gracefully", async () => {
      const bonusPoint = 100;
      const config = { isEnabled: true, bonusPoint, message: null };
      const grantError = new InsufficientBalanceError("100", 200);
      const markFailedError = new Error("Failed to mark as failed");

      mockConfigService.get.mockResolvedValue(config);
      mockRepository.create.mockResolvedValue({});
      mockWalletService.checkCommunityWalletBalanceInTransaction.mockRejectedValue(grantError);
      mockRepository.markAsFailed.mockRejectedValue(markFailedError);

      const result = await service.grantSignupBonusIfEnabled(
        mockCtx,
        userId,
        communityId,
        sourceId,
        mockTx,
      );

      expect(result).toEqual({ granted: false, transaction: null });
      // Should not throw, just log and return failure
    });
  });
});
