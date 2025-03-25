import { Prisma, TransactionReason, WalletType } from "@prisma/client";
import WalletService from "@/application/membership/wallet/service";
import { InsufficientBalanceError, NotFoundError, ValidationError } from "@/errors/graphql";
import { IContext } from "@/types/server";
import WalletValidator from "@/application/membership/wallet/validator";

jest.mock("@/application/membership/wallet/data/repository");
jest.mock("@/application/membership/wallet/data/converter");

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

    it("should validate transfer for POINT_REWARD (use existing member wallet)", async () => {
      jest
        .spyOn(WalletService, "findCommunityWalletOrThrow")
        .mockResolvedValue(communityWallet as any);
      jest.spyOn(WalletService, "findMemberWalletOrThrow").mockResolvedValue(memberWallet as any);

      const result = await WalletValidator.validateCommunityMemberTransfer(
        mockCtx,
        mockTx,
        communityId,
        userId,
        transferPoints,
        TransactionReason.POINT_REWARD,
      );

      expect(result).toEqual({
        fromWalletId: communityWallet.id,
        toWalletId: memberWallet.id,
      });
    });

    it("should validate transfer for TICKET_PURCHASED (member to community)", async () => {
      jest
        .spyOn(WalletService, "findCommunityWalletOrThrow")
        .mockResolvedValue(communityWallet as any);
      jest.spyOn(WalletService, "findMemberWalletOrThrow").mockResolvedValue(memberWallet as any);

      const result = await WalletValidator.validateCommunityMemberTransfer(
        mockCtx,
        mockTx,
        communityId,
        userId,
        transferPoints,
        TransactionReason.TICKET_PURCHASED,
      );

      expect(result).toEqual({
        fromWalletId: memberWallet.id,
        toWalletId: communityWallet.id,
      });
    });

    it("should throw error for DONATION (unsupported direction)", async () => {
      jest
        .spyOn(WalletService, "findCommunityWalletOrThrow")
        .mockRejectedValue(
          new ValidationError("Use validateMemberToMemberDonation() for DONATION"),
        );

      await expect(
        WalletValidator.validateCommunityMemberTransfer(
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

  describe("validateMemberToMemberDonation", () => {
    const fromWalletId = "wallet-from";
    const toUserId = "user-to";

    const fromWallet = {
      ...memberWallet,
      id: fromWalletId,
    };
    const toWallet = { ...memberWallet, id: "wallet-to" };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return wallet ids if validation passes", async () => {
      // [1] モック設定
      jest.spyOn(WalletService, "checkIfMemberWalletExists").mockResolvedValue(fromWallet as any);
      jest.spyOn(WalletService, "createMemberWalletIfNeeded").mockResolvedValue(toWallet as any);
      // [2] 実行
      const result = await WalletValidator.validateMemberToMemberDonation(
        mockCtx,
        mockTx,
        fromWalletId,
        toUserId,
        communityId,
        transferPoints,
      );

      // [3] 検証
      expect(WalletService.checkIfMemberWalletExists).toHaveBeenCalledWith(mockCtx, fromWalletId);
      expect(WalletService.createMemberWalletIfNeeded).toHaveBeenCalledWith(
        mockCtx,
        toUserId,
        communityId,
        mockTx,
      );
      expect(result).toEqual({
        fromWalletId,
        toWalletId: toWallet.id,
      });
    });

    it("should throw NotFoundError if fromWallet does not exist", async () => {
      jest
        .spyOn(WalletService, "checkIfMemberWalletExists")
        .mockRejectedValue(new NotFoundError("wallet not found"));

      await expect(
        WalletValidator.validateMemberToMemberDonation(
          mockCtx,
          mockTx,
          fromWalletId,
          toUserId,
          communityId,
          transferPoints,
        ),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw error if validateTransfer fails", async () => {
      const fromWallet = {
        ...memberWallet,
        id: fromWalletId,
        currentPointView: { currentPoint: 1 },
      };

      jest.spyOn(WalletService, "checkIfMemberWalletExists").mockResolvedValue(fromWallet as any);
      jest
        .spyOn(WalletService, "createMemberWalletIfNeeded")
        .mockResolvedValue(memberWallet as any);

      await expect(
        WalletValidator.validateMemberToMemberDonation(
          mockCtx,
          mockTx,
          fromWalletId,
          toUserId,
          communityId,
          transferPoints,
        ),
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
