import { Prisma, TransactionReason } from "@prisma/client";
import { IContext } from "@/types/server";
import TransactionConverter from "@/application/domain/transaction/data/converter";
import TransactionRepository from "@/application/domain/transaction/data/repository";
import TransactionService from "@/application/domain/transaction/service";

jest.mock("@/application/domain/transaction/data/converter", () => ({
  __esModule: true,
  default: {
    issueCommunityPoint: jest.fn(),
    grantCommunityPoint: jest.fn(),
    donateSelfPoint: jest.fn(),
    giveRewardPoint: jest.fn(),
    purchaseTicket: jest.fn(),
  },
}));

jest.mock("@/application/domain/transaction/data/repository", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    refreshCurrentPoints: jest.fn(),
  },
}));

describe("TransactionService", () => {
  const ctx = {} as IContext;
  const tx = {} as Prisma.TransactionClient;
  const communityId = "community-1";
  const userId = "user-1";
  const walletId = "wallet-1";
  const memberWalletId = "wallet-2";
  const opportunityId = "opportunity-123";
  const participationId = "participation-123";
  const transferPoints = 100;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("issueCommunityPoint", () => {
    it("should create transaction and refresh transferPoints", async () => {
      const mockTransaction = {
        id: "tx-1",
        createdAt: new Date(),
        updatedAt: null,
        reason: TransactionReason.POINT_ISSUED,
        participationId: null,
        from: null,
        fromPointChange: transferPoints,
        to: walletId,
        toPointChange: transferPoints,
      };
      const input = {
        communityId,
        to: userId,
        toWalletId: walletId,
        fromPointChange: transferPoints,
        toPointChange: transferPoints,
        transferPoints: transferPoints,
      };

      (TransactionConverter.issueCommunityPoint as jest.Mock).mockReturnValue(input);
      (TransactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);
      (TransactionRepository.refreshCurrentPoints as jest.Mock).mockResolvedValue(undefined);

      const result = await TransactionService.issueCommunityPoint(ctx, input);

      expect(TransactionConverter.issueCommunityPoint).toHaveBeenCalledWith({
        communityId,
        to: userId,
        toWalletId: walletId,
        fromPointChange: transferPoints,
        toPointChange: transferPoints,
        transferPoints: transferPoints,
      });
      expect(TransactionRepository.create).toHaveBeenCalledWith(ctx, input);
      expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(ctx);
      expect(result).toBe(mockTransaction);
    });
  });

  describe("grantCommunityPoint", () => {
    it("should create transaction and refresh transferPoints", async () => {
      const mockTransaction = {
        id: "tx-2",
        createdAt: new Date(),
        updatedAt: null,
        reason: TransactionReason.GRANT,
        participationId: null,
        from: memberWalletId,
        fromPointChange: transferPoints,
        to: walletId,
        toPointChange: transferPoints,
      };
      const input = {
        communityId,
        toPointChange: transferPoints,
        fromPointChange: transferPoints,
        fromWalletId: memberWalletId,
        toWalletId: walletId,
        toUserId: userId,
        transferPoints: transferPoints,
      };

      (TransactionConverter.grantCommunityPoint as jest.Mock).mockReturnValue(input);
      (TransactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);
      (TransactionRepository.refreshCurrentPoints as jest.Mock).mockResolvedValue(undefined);

      const result = await TransactionService.grantCommunityPoint(ctx, input, memberWalletId, tx);

      expect(TransactionConverter.grantCommunityPoint).toHaveBeenCalledWith(
        {
          communityId,
          toPointChange: transferPoints,
          fromPointChange: transferPoints,
          fromWalletId: memberWalletId,
          toWalletId: walletId,
          toUserId: userId,
          transferPoints: transferPoints,
        },
        memberWalletId,
      );
      expect(TransactionRepository.create).toHaveBeenCalledWith(ctx, input, tx);
      expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(ctx, tx);
      expect(result).toBe(mockTransaction);
    });
  });

  describe("donateSelfPoint", () => {
    it("should create transaction and refresh transferPoints", async () => {
      const mockTransaction = {
        id: "tx-3",
        createdAt: new Date(),
        updatedAt: null,
        reason: TransactionReason.DONATION,
        participationId: null,
        from: memberWalletId,
        fromPointChange: transferPoints,
        to: walletId,
        toPointChange: transferPoints,
      };
      const input = {
        communityId,
        toPointChange: transferPoints,
        fromPointChange: transferPoints,
        fromWalletId: memberWalletId,
        toWalletId: walletId,
        toUserId: userId,
        transferPoints: transferPoints,
      };

      (TransactionConverter.donateSelfPoint as jest.Mock).mockReturnValue(input);
      (TransactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);
      (TransactionRepository.refreshCurrentPoints as jest.Mock).mockResolvedValue(undefined);

      const result = await TransactionService.donateSelfPoint(
        ctx,
        memberWalletId,
        walletId,
        transferPoints,
        tx,
      );

      expect(TransactionConverter.donateSelfPoint).toHaveBeenCalledWith(
        memberWalletId,
        walletId,
        transferPoints,
      );
      expect(TransactionRepository.create).toHaveBeenCalledWith(ctx, input, tx);
      expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(ctx, tx);
      expect(result).toBe(mockTransaction);
    });
  });

  describe("giveRewardPoint", () => {
    it("should create transaction and refresh transferPoints", async () => {
      const mockTransaction = {
        id: "tx-5",
        createdAt: new Date(),
        updatedAt: null,
        reason: TransactionReason.POINT_REWARD,
        participationId,
        from: memberWalletId,
        fromPointChange: -transferPoints,
        to: walletId,
        toPointChange: transferPoints,
      };
      const input = {
        fromWalletId: memberWalletId,
        fromPointChange: -transferPoints,
        toWalletId: walletId,
        toPointChange: transferPoints,
        participationId,
      };

      (TransactionConverter.giveRewardPoint as jest.Mock).mockReturnValue(input);
      (TransactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);
      (TransactionRepository.refreshCurrentPoints as jest.Mock).mockResolvedValue(undefined);

      const result = await TransactionService.giveRewardPoint(
        ctx,
        tx,
        participationId,
        transferPoints,
        memberWalletId,
        walletId,
      );

      expect(TransactionConverter.giveRewardPoint).toHaveBeenCalledWith(
        memberWalletId,
        walletId,
        participationId,
        transferPoints,
      );
      expect(TransactionRepository.create).toHaveBeenCalledWith(ctx, input, tx);
      expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(ctx, tx);
      expect(result).toBe(mockTransaction);
    });
  });

  describe("purchaseTicket", () => {
    it("should create transaction and refresh transferPoints", async () => {
      const mockTransaction = {
        id: "tx-6",
        createdAt: new Date(),
        updatedAt: null,
        reason: TransactionReason.TICKET_PURCHASED,
        participationId: null,
        from: memberWalletId,
        fromPointChange: transferPoints,
        to: walletId,
        toPointChange: transferPoints,
      };
      const input = {
        userId,
        communityId,
        opportunityId,
        fromWalletId: memberWalletId,
        toWalletId: walletId,
        fromPointChange: transferPoints,
        toPointChange: transferPoints,
        transferPoints: transferPoints,
      };

      (TransactionConverter.purchaseTicket as jest.Mock).mockReturnValue(input);
      (TransactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);
      (TransactionRepository.refreshCurrentPoints as jest.Mock).mockResolvedValue(undefined);

      const result = await TransactionService.purchaseTicket(
        ctx,
        tx,
        memberWalletId,
        walletId,
        transferPoints,
      );

      expect(TransactionConverter.purchaseTicket).toHaveBeenCalledWith(
        memberWalletId,
        walletId,
        transferPoints,
      );
      expect(TransactionRepository.create).toHaveBeenCalledWith(ctx, input, tx);
      expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(ctx, tx);
      expect(result).toBe(mockTransaction);
    });
  });
});
