import "reflect-metadata";
import { Prisma, TransactionReason, WalletType } from "@prisma/client";
import { container } from "tsyringe";
import { InsufficientBalanceError, ValidationError } from "@/errors/graphql";
import { IContext } from "@/types/server";
import WalletValidator from "@/application/domain/account/wallet/validator";
import { PrismaWallet } from "@/application/domain/account/wallet/data/type";
import WalletService from "@/application/domain/account/wallet/service";

// --- Mockクラス ---
class MockWalletService implements Partial<WalletService> {
  findCommunityWalletOrThrow = jest.fn();
  createMemberWalletIfNeeded = jest.fn();
  findMemberWalletOrThrow = jest.fn();
}

describe("WalletValidator", () => {
  let validator: WalletValidator;
  let mockService: MockWalletService;

  const mockCtx = {} as IContext;
  const mockTx = {} as Prisma.TransactionClient;
  const walletId = "wallet-123";
  const communityId = "community-456";
  const userId = "user-789";
  const transferPoints = 100;

  const baseWallet = {
    id: walletId,
    communityId,
    userId,
    currentPointView: { currentPoint: 1000 },
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

    mockService = new MockWalletService();

    container.register("WalletService", { useValue: mockService });

    validator = container.resolve(WalletValidator);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("validateCommunityMemberTransfer", () => {
    it("should validate transfer for GRANT (createIfNeeded = true)", async () => {
      mockService.findCommunityWalletOrThrow.mockResolvedValue(communityWallet);
      mockService.createMemberWalletIfNeeded.mockResolvedValue(memberWallet);

      const result = await validator.validateCommunityMemberTransfer(
        mockCtx,
        mockTx,
        communityId,
        userId,
        transferPoints,
        TransactionReason.GRANT,
      );

      expect(result).toEqual({
        fromWalletId: communityWallet.id,
        toWalletId: memberWallet.id,
      });
    });

    it("should validate transfer for ONBOARDING (createIfNeeded = false)", async () => {
      mockService.findCommunityWalletOrThrow.mockResolvedValue(communityWallet);
      mockService.findMemberWalletOrThrow.mockResolvedValue(memberWallet);

      const result = await validator.validateCommunityMemberTransfer(
        mockCtx,
        mockTx,
        communityId,
        userId,
        transferPoints,
        TransactionReason.ONBOARDING,
      );

      expect(result).toEqual({
        fromWalletId: communityWallet.id,
        toWalletId: memberWallet.id,
      });
      expect(mockService.findMemberWalletOrThrow).toHaveBeenCalledWith(mockCtx, userId, communityId);
    });

    it("should throw ValidationError for MEMBER_TO_MEMBER transaction reasons", async () => {
      mockService.findCommunityWalletOrThrow.mockResolvedValue(communityWallet);
      mockService.findMemberWalletOrThrow.mockResolvedValue(memberWallet);

      await expect(
        validator.validateCommunityMemberTransfer(
          mockCtx,
          mockTx,
          communityId,
          userId,
          transferPoints,
          TransactionReason.POINT_REWARD,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("should validate transfer with zero points", async () => {
      mockService.findCommunityWalletOrThrow.mockResolvedValue(communityWallet);
      mockService.createMemberWalletIfNeeded.mockResolvedValue(memberWallet);

      const result = await validator.validateCommunityMemberTransfer(
        mockCtx,
        mockTx,
        communityId,
        userId,
        0,
        TransactionReason.GRANT,
      );

      expect(result).toEqual({
        fromWalletId: communityWallet.id,
        toWalletId: memberWallet.id,
      });
    });

    it("should validate transfer with negative points", async () => {
      mockService.findCommunityWalletOrThrow.mockResolvedValue(communityWallet);
      mockService.createMemberWalletIfNeeded.mockResolvedValue(memberWallet);

      const result = await validator.validateCommunityMemberTransfer(
        mockCtx,
        mockTx,
        communityId,
        userId,
        -50,
        TransactionReason.GRANT,
      );

      expect(result).toEqual({
        fromWalletId: communityWallet.id,
        toWalletId: memberWallet.id,
      });
    });
  });

  describe("validateTransferMemberToMember", () => {
    it("should validate transfer from member to member correctly", async () => {
      const fromWallet = {
        ...memberWallet,
        id: "wallet-from",
        currentPointView: { currentPoint: 500 },
      } as PrismaWallet;

      const toWallet = {
        ...memberWallet,
        id: "wallet-to",
        currentPointView: { currentPoint: 0 },
      } as PrismaWallet;

      const result = await validator.validateTransferMemberToMember(fromWallet, toWallet, 100);

      expect(result).toEqual({
        fromWalletId: "wallet-from",
        toWalletId: "wallet-to",
      });
    });

    it("should throw InsufficientBalanceError if balance is insufficient", async () => {
      const fromWallet = {
        ...memberWallet,
        id: "wallet-from",
        currentPointView: { currentPoint: 50 },
      } as PrismaWallet;
      const toWallet = {
        ...memberWallet,
        id: "wallet-to",
        currentPointView: { currentPoint: 0 },
      } as PrismaWallet;

      await expect(
        validator.validateTransferMemberToMember(fromWallet, toWallet, 100),
      ).rejects.toThrow(InsufficientBalanceError);
    });
  });

  describe("validateTransfer", () => {
    it("should pass if currentPoint is sufficient", async () => {
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: 500 },
      } as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: 0 },
      } as PrismaWallet;

      await expect(validator.validateTransfer(100, fromWallet, toWallet)).resolves.not.toThrow();
    });

    it("should throw ValidationError if fromWallet is null", async () => {
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: 0 },
      } as PrismaWallet;

      await expect(validator.validateTransfer(100, null, toWallet)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw ValidationError if toWallet is null", async () => {
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: 500 },
      } as PrismaWallet;

      await expect(validator.validateTransfer(100, fromWallet, null)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw InsufficientBalanceError if currentPoint is missing", async () => {
      const fromWallet = {
        id: "wallet-from",
        currentPointView: {},
      } as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: 0 },
      } as PrismaWallet;

      await expect(validator.validateTransfer(100, fromWallet, toWallet)).rejects.toThrow(
        InsufficientBalanceError,
      );
    });

    it("should throw InsufficientBalanceError if currentPoint is insufficient", async () => {
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: 50 },
      } as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: 0 },
      } as PrismaWallet;

      await expect(validator.validateTransfer(100, fromWallet, toWallet)).rejects.toThrow(
        InsufficientBalanceError,
      );
    });

    it("should pass validation with zero transfer points", async () => {
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: 100 },
      } as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: 0 },
      } as PrismaWallet;

      await expect(validator.validateTransfer(0, fromWallet, toWallet)).resolves.not.toThrow();
    });

    it("should pass validation with negative transfer points", async () => {
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: 100 },
      } as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: 0 },
      } as PrismaWallet;

      await expect(validator.validateTransfer(-50, fromWallet, toWallet)).resolves.not.toThrow();
    });

    it("should throw ValidationError if fromWallet is undefined", async () => {
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: 0 },
      } as PrismaWallet;

      await expect(validator.validateTransfer(100, undefined as any, toWallet)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw ValidationError if toWallet is undefined", async () => {
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: 500 },
      } as PrismaWallet;

      await expect(validator.validateTransfer(100, fromWallet, undefined as any)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw InsufficientBalanceError if currentPointView is null", async () => {
      const fromWallet = {
        id: "wallet-from",
        currentPointView: null,
      } as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: 0 },
      } as PrismaWallet;

      await expect(validator.validateTransfer(100, fromWallet, toWallet)).rejects.toThrow(
        InsufficientBalanceError,
      );
    });

    it("should throw InsufficientBalanceError if currentPointView is undefined", async () => {
      const fromWallet = {
        id: "wallet-from",
        currentPointView: undefined,
      } as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: 0 },
      } as PrismaWallet;

      await expect(validator.validateTransfer(100, fromWallet, toWallet)).rejects.toThrow(
        InsufficientBalanceError,
      );
    });
  });

  describe("TransactionReason validation through validateCommunityMemberTransfer", () => {
    it("should handle TICKET_PURCHASED as MEMBER_TO_MEMBER and throw ValidationError", async () => {
      mockService.findCommunityWalletOrThrow.mockResolvedValue(communityWallet);
      mockService.findMemberWalletOrThrow.mockResolvedValue(memberWallet);

      await expect(
        validator.validateCommunityMemberTransfer(
          mockCtx,
          mockTx,
          communityId,
          userId,
          transferPoints,
          TransactionReason.TICKET_PURCHASED,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("should handle TICKET_REFUNDED as MEMBER_TO_MEMBER and throw ValidationError", async () => {
      mockService.findCommunityWalletOrThrow.mockResolvedValue(communityWallet);
      mockService.findMemberWalletOrThrow.mockResolvedValue(memberWallet);

      await expect(
        validator.validateCommunityMemberTransfer(
          mockCtx,
          mockTx,
          communityId,
          userId,
          transferPoints,
          TransactionReason.TICKET_REFUNDED,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("should handle DONATION as MEMBER_TO_MEMBER and throw ValidationError", async () => {
      mockService.findCommunityWalletOrThrow.mockResolvedValue(communityWallet);
      mockService.findMemberWalletOrThrow.mockResolvedValue(memberWallet);

      await expect(
        validator.validateCommunityMemberTransfer(
          mockCtx,
          mockTx,
          communityId,
          userId,
          transferPoints,
          TransactionReason.DONATION,
        ),
      ).rejects.toThrow(ValidationError);
    });
  });
});
