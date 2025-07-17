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
    currentPointView: { currentPoint: BigInt(1000) },
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
  });

  describe("validateTransferMemberToMember", () => {
    it("should validate transfer from member to member correctly", async () => {
      const fromWallet = {
        ...memberWallet,
        id: "wallet-from",
        currentPointView: { currentPoint: BigInt(500) },
      } as PrismaWallet;

      const toWallet = {
        ...memberWallet,
        id: "wallet-to",
        currentPointView: { currentPoint: BigInt(0) },
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
        currentPointView: { currentPoint: BigInt(50) },
      } as PrismaWallet;
      const toWallet = {
        ...memberWallet,
        id: "wallet-to",
        currentPointView: { currentPoint: BigInt(0) },
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
        currentPointView: { currentPoint: BigInt(500) },
      } as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: BigInt(0) },
      } as PrismaWallet;

      await expect(validator.validateTransfer(100, fromWallet, toWallet)).resolves.not.toThrow();
    });

    it("should throw ValidationError if fromWallet is null", async () => {
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: BigInt(0) },
      } as PrismaWallet;

      await expect(validator.validateTransfer(100, null, toWallet)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw ValidationError if toWallet is null", async () => {
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: BigInt(500) },
      } as PrismaWallet;

      await expect(validator.validateTransfer(100, fromWallet, null)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw DatabaseError if currentPoint is missing", async () => {
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: null },
      } as unknown as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: BigInt(0) },
      } as PrismaWallet;

      await expect(validator.validateTransfer(100, fromWallet, toWallet)).rejects.toThrow(
        "Current point is not available for wallet",
      );
    });

    it("should handle BigInt boundary values correctly", async () => {
      const maxSafeBigInt = BigInt(Number.MAX_SAFE_INTEGER);
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: maxSafeBigInt },
      } as unknown as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: BigInt(0) },
      } as PrismaWallet;

      await expect(
        validator.validateTransfer(Number.MAX_SAFE_INTEGER, fromWallet, toWallet),
      ).resolves.not.toThrow();
    });

    it("should handle very large BigInt values", async () => {
      const veryLargeBigInt = BigInt("999999999999999999999999999999");
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: veryLargeBigInt },
      } as unknown as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: BigInt(0) },
      } as PrismaWallet;

      await expect(
        validator.validateTransfer(1000000, fromWallet, toWallet),
      ).resolves.not.toThrow();
    });

    it("should throw InsufficientBalanceError for BigInt boundary case", async () => {
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: BigInt(999) },
      } as unknown as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: BigInt(0) },
      } as PrismaWallet;

      await expect(validator.validateTransfer(1000, fromWallet, toWallet)).rejects.toThrow(
        InsufficientBalanceError,
      );
    });

    it("should handle zero BigInt values", async () => {
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: BigInt(0) },
      } as unknown as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: BigInt(0) },
      } as PrismaWallet;

      await expect(validator.validateTransfer(1, fromWallet, toWallet)).rejects.toThrow(
        InsufficientBalanceError,
      );
    });

    it("should handle negative transfer amounts", async () => {
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: BigInt(1000) },
      } as unknown as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: BigInt(0) },
      } as PrismaWallet;

      await expect(validator.validateTransfer(-100, fromWallet, toWallet)).resolves.not.toThrow();
    });

    it("should throw InsufficientBalanceError if currentPoint is insufficient", async () => {
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: BigInt(50) },
      } as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: BigInt(0) },
      } as PrismaWallet;

      await expect(validator.validateTransfer(100, fromWallet, toWallet)).rejects.toThrow(
        InsufficientBalanceError,
      );
    });

    it("should handle BigInt overflow scenarios", async () => {
      const maxBigInt = BigInt("9007199254740991999999999999999999999");
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: maxBigInt },
      } as unknown as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: BigInt(0) },
      } as PrismaWallet;

      await expect(validator.validateTransfer(1000, fromWallet, toWallet)).resolves.not.toThrow();
    });

    it("should handle precision loss in BigInt conversion", async () => {
      const precisionTestValue = BigInt("999999999999999999999999999999999");
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: precisionTestValue },
      } as unknown as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: BigInt(0) },
      } as PrismaWallet;

      await expect(
        validator.validateTransfer(Number.MAX_SAFE_INTEGER - 1, fromWallet, toWallet),
      ).resolves.not.toThrow();
    });

    it("should handle mixed BigInt and number comparison edge cases", async () => {
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: BigInt(Number.MAX_SAFE_INTEGER) },
      } as unknown as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: BigInt(0) },
      } as PrismaWallet;

      await expect(
        validator.validateTransfer(Number.MAX_SAFE_INTEGER + 1, fromWallet, toWallet),
      ).rejects.toThrow(InsufficientBalanceError);
    });

    it("should handle very small BigInt values", async () => {
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: BigInt(1) },
      } as unknown as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: BigInt(0) },
      } as PrismaWallet;

      await expect(validator.validateTransfer(1, fromWallet, toWallet)).resolves.not.toThrow();

      await expect(validator.validateTransfer(2, fromWallet, toWallet)).rejects.toThrow(
        InsufficientBalanceError,
      );
    });
    it("should handle BigInt overflow scenarios", async () => {
      const maxBigInt = BigInt("9007199254740991999999999999999999999");
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: maxBigInt },
      } as unknown as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: BigInt(0) },
      } as PrismaWallet;

      await expect(validator.validateTransfer(1000, fromWallet, toWallet)).resolves.not.toThrow();
    });

    it("should handle precision loss in BigInt conversion", async () => {
      const precisionTestValue = BigInt("999999999999999999999999999999999");
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: precisionTestValue },
      } as unknown as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: BigInt(0) },
      } as PrismaWallet;

      await expect(
        validator.validateTransfer(Number.MAX_SAFE_INTEGER - 1, fromWallet, toWallet),
      ).resolves.not.toThrow();
    });

    it("should handle mixed BigInt and number comparison edge cases", async () => {
      const fromWallet = {
        id: "wallet-from",
        currentPointView: { currentPoint: BigInt(Number.MAX_SAFE_INTEGER) },
      } as unknown as PrismaWallet;
      const toWallet = {
        id: "wallet-to",
        currentPointView: { currentPoint: BigInt(0) },
      } as PrismaWallet;

      await expect(
        validator.validateTransfer(Number.MAX_SAFE_INTEGER + 1, fromWallet, toWallet),
      ).rejects.toThrow(InsufficientBalanceError);
    });
  });
});
