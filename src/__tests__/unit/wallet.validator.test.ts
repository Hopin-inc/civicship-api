import { Prisma, TransactionReason, WalletType } from "@prisma/client";
import { InsufficientBalanceError, ValidationError } from "@/errors/graphql";
import { IContext } from "@/types/server";
import WalletService from "@/application/domain/wallet/service";
import WalletValidator from "@/application/domain/wallet/validator";
import { PrismaWallet } from "@/application/domain/wallet/data/type";

jest.mock("@/application/domain/wallet/data/repository");
jest.mock("@/application/domain/wallet/data/converter");

describe("WalletValidator", () => {
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
  });

  describe("validateCommunityMemberTransfer", () => {
    it("should validate transfer for GRANT (createIfNeeded = true)", async () => {
      jest
        .spyOn(WalletService, "findCommunityWalletOrThrow")
        .mockResolvedValue(communityWallet as any);
      jest
        .spyOn(WalletService, "createMemberWalletIfNeeded")
        .mockResolvedValue(memberWallet as any);

      const result = await WalletValidator.validateCommunityMemberTransfer(
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

  describe("validateMemberToMemberDonation", () => {
    const fromWalletId = "wallet-from";
    const toWalletId = "wallet-to";
    const transferPoints = 100;

    const fromWallet = {
      ...memberWallet,
      id: fromWalletId,
      currentPointView: { currentPoint: 200 },
    } as PrismaWallet;

    const toWallet = {
      ...memberWallet,
      id: toWalletId,
      currentPointView: { currentPoint: 0 },
    } as PrismaWallet;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return wallet ids if validation passes", async () => {
      const validateTransferMock = jest
        .spyOn(WalletValidator as any, "validateTransfer")
        .mockResolvedValue(undefined);

      const result = await WalletValidator.validateTransferMemberToMember(
        fromWallet,
        toWallet,
        transferPoints,
      );

      expect(validateTransferMock).toHaveBeenCalledWith(transferPoints, fromWallet, toWallet);

      expect(result).toEqual({
        fromWalletId,
        toWalletId,
      });
    });

    it("should throw error if validateTransfer fails", async () => {
      jest
        .spyOn(WalletValidator as any, "validateTransfer")
        .mockRejectedValue(new InsufficientBalanceError(100, 200));

      await expect(
        WalletValidator.validateTransferMemberToMember(fromWallet, toWallet, transferPoints),
      ).rejects.toThrow(InsufficientBalanceError);
    });
  });

  describe("validateTransfer", () => {
    const fromWalletBase = {
      id: "wallet-from",
      currentPointView: { currentPoint: 500 },
    };

    const toWalletBase = {
      id: "wallet-to",
      currentPointView: { currentPoint: 0 },
    };

    it("should pass if currentPoint is sufficient", async () => {
      const fromWallet = { ...fromWalletBase };
      const toWallet = { ...toWalletBase };

      await expect(
        WalletValidator.validateTransfer(100, fromWallet as any, toWallet as any),
      ).resolves.not.toThrow();
    });

    it("should throw ValidationError if fromWallet is null", async () => {
      const toWallet = { ...toWalletBase };

      await expect(WalletValidator.validateTransfer(100, null, toWallet as any)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw ValidationError if toWallet is null", async () => {
      const fromWallet = { ...fromWalletBase };

      await expect(WalletValidator.validateTransfer(100, fromWallet as any, null)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw InsufficientBalanceError if currentPoint is missing", async () => {
      const fromWallet = { ...fromWalletBase, currentPointView: {} };
      const toWallet = { ...toWalletBase };

      await expect(
        WalletValidator.validateTransfer(100, fromWallet as any, toWallet as any),
      ).rejects.toThrow(InsufficientBalanceError);
    });

    it("should throw InsufficientBalanceError if currentPoint is insufficient", async () => {
      const fromWallet = { ...fromWalletBase, currentPointView: { currentPoint: 50 } };
      const toWallet = { ...toWalletBase };

      await expect(
        WalletValidator.validateTransfer(100, fromWallet as any, toWallet as any),
      ).rejects.toThrow(InsufficientBalanceError);
    });

    it("should throw InsufficientBalanceError if currentPointView is null", async () => {
      const fromWallet = { id: "wallet-from", currentPointView: null };
      const toWallet = { id: "wallet-to", currentPointView: { currentPoint: 0 } };

      await expect(
        WalletValidator.validateTransfer(100, fromWallet as any, toWallet as any),
      ).rejects.toThrow(InsufficientBalanceError);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
