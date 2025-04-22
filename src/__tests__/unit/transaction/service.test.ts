import { TransactionReason } from "@prisma/client";
import TransactionConverter from "@/application/domain/transaction/data/converter";
import TransactionRepository from "@/application/domain/transaction/data/repository";
import TransactionService from "@/application/domain/transaction/service";
import {
  mockCtx,
  mockFunctions,
  mockTx,
  TRANSACTION_INPUTS,
  TRANSACTION_TEST_DATA,
} from "@/__tests__/helper/test-data";

jest.mock("@/application/domain/transaction/data/repository");
jest.mock("@/application/domain/transaction/data/converter");

describe("TransactionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("issueCommunityPoint", () => {
    it("should create transaction and refresh points", async () => {
      const mockTransaction = {
        id: "tx-1",
        createdAt: new Date(),
        updatedAt: null,
        reason: TransactionReason.POINT_ISSUED,
        participationId: null,
        from: null,
        fromPointChange: 100,
        to: "wallet-1",
        toPointChange: 100,
      };
      const mockCreateInput = {
        ...TRANSACTION_INPUTS.issueCommunityPoint,
        transferPoints: 100,
        reason: TransactionReason.POINT_ISSUED,
      };

      mockFunctions.convertIssueCommunityPoint(mockCreateInput);
      mockFunctions.createTransaction(mockTransaction);
      mockFunctions.refreshCurrentPoints();

      const result = await TransactionService.issueCommunityPoint(mockCtx, {
        ...TRANSACTION_INPUTS.issueCommunityPoint,
        transferPoints: 100,
      });

      expect(TransactionConverter.issueCommunityPoint).toHaveBeenCalledWith({
        ...TRANSACTION_INPUTS.issueCommunityPoint,
        transferPoints: 100,
      });
      expect(TransactionRepository.create).toHaveBeenCalledWith(mockCtx, mockCreateInput);
      expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(mockCtx);
      expect(result).toBe(mockTransaction);
    });
  });

  describe("grantCommunityPoint", () => {
    it("should create transaction and refresh points", async () => {
      const mockTransaction = {
        id: "tx-2",
        createdAt: new Date(),
        updatedAt: null,
        reason: TransactionReason.GRANT,
        participationId: null,
        from: "wallet-2",
        fromPointChange: 100,
        to: "wallet-1",
        toPointChange: 100,
      };
      const mockCreateInput = {
        ...TRANSACTION_INPUTS.grantCommunityPoint,
        transferPoints: 100,
        reason: TransactionReason.GRANT,
      };

      mockFunctions.convertGrantCommunityPoint(mockCreateInput);
      mockFunctions.createTransaction(mockTransaction);
      mockFunctions.refreshCurrentPoints();

      const result = await TransactionService.grantCommunityPoint(
        mockCtx,
        { ...TRANSACTION_INPUTS.grantCommunityPoint, transferPoints: 100 },
        TRANSACTION_TEST_DATA.memberWalletId,
        mockTx,
      );

      expect(TransactionConverter.grantCommunityPoint).toHaveBeenCalledWith(
        { ...TRANSACTION_INPUTS.grantCommunityPoint, transferPoints: 100 },
        TRANSACTION_TEST_DATA.memberWalletId,
      );
      expect(TransactionRepository.create).toHaveBeenCalledWith(mockCtx, mockCreateInput, mockTx);
      expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(mockCtx, mockTx);
      expect(result).toBe(mockTransaction);
    });
  });

  describe("donateSelfPoint", () => {
    it("should create transaction and refresh points", async () => {
      const mockTransaction = {
        id: "tx-3",
        createdAt: new Date(),
        updatedAt: null,
        reason: TransactionReason.DONATION,
        participationId: null,
        from: "wallet-2",
        fromPointChange: 100,
        to: "wallet-1",
        toPointChange: 100,
      };
      const mockCreateInput = {
        ...TRANSACTION_INPUTS.donateSelfPoint,
        transferPoints: 100,
        reason: TransactionReason.DONATION,
      };

      mockFunctions.convertDonateSelfPoint(mockCreateInput);
      mockFunctions.createTransaction(mockTransaction);

      const result = await TransactionService.donateSelfPoint(
        mockCtx,
        { ...TRANSACTION_INPUTS.donateSelfPoint, transferPoints: 100 },
        TRANSACTION_TEST_DATA.toWalletId,
        mockTx,
      );

      expect(TransactionConverter.donateSelfPoint).toHaveBeenCalledWith(
        { ...TRANSACTION_INPUTS.donateSelfPoint, transferPoints: 100 },
        TRANSACTION_TEST_DATA.toWalletId,
      );
      expect(TransactionRepository.create).toHaveBeenCalledWith(mockCtx, mockCreateInput, mockTx);
      expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(mockCtx, mockTx);
      expect(result).toBe(mockTransaction);
    });
  });

  describe("giveOnboardingPoint", () => {
    it("should create transaction and refresh points", async () => {
      const mockTransaction = {
        id: "tx-4",
        createdAt: new Date(),
        updatedAt: null,
        reason: TransactionReason.ONBOARDING,
        participationId: null,
        from: "wallet-2",
        fromPointChange: 100,
        to: "wallet-1",
        toPointChange: 100,
      };
      const mockCreateInput = {
        ...TRANSACTION_INPUTS.giveOnboardingPoint,
        reason: TransactionReason.ONBOARDING,
      };

      mockFunctions.convertGiveOnboardingPoint(mockCreateInput);
      mockFunctions.createTransaction(mockTransaction);

      const result = await TransactionService.giveOnboardingPoint(
        mockCtx,
        TRANSACTION_INPUTS.giveOnboardingPoint,
        mockTx,
      );

      expect(TransactionConverter.giveOnboardingPoint).toHaveBeenCalledWith(
        TRANSACTION_INPUTS.giveOnboardingPoint,
      );
      expect(TransactionRepository.create).toHaveBeenCalledWith(mockCtx, mockCreateInput, mockTx);
      expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(mockCtx, mockTx);
      expect(result).toBe(mockTransaction);
    });
  });

  describe("giveRewardPoint", () => {
    it("should create transaction and refresh points", async () => {
      const mockTransaction = {
        id: "tx-5",
        createdAt: new Date(),
        updatedAt: null,
        reason: TransactionReason.POINT_REWARD,
        participationId: "participation-123",
        from: "wallet-from",
        fromPointChange: -100,
        to: "wallet-to",
        toPointChange: 100,
      };
      const mockCreateInput = {
        ...TRANSACTION_INPUTS.giveRewardPoint,
        reason: TransactionReason.POINT_REWARD,
      };

      mockFunctions.convertGiveRewardPoint(mockCreateInput);
      mockFunctions.createTransaction(mockTransaction);
      mockFunctions.refreshCurrentPoints();

      const result = await TransactionService.giveRewardPoint(
        mockCtx,
        mockTx,
        TRANSACTION_TEST_DATA.participationId,
        TRANSACTION_TEST_DATA.pointsToEarn,
        TRANSACTION_TEST_DATA.fromWalletId,
        TRANSACTION_TEST_DATA.toWalletId,
      );

      expect(TransactionConverter.giveRewardPoint).toHaveBeenCalledWith({
        fromWalletId: TRANSACTION_TEST_DATA.fromWalletId,
        fromPointChange: TRANSACTION_TEST_DATA.pointsToEarn,
        toWalletId: TRANSACTION_TEST_DATA.toWalletId,
        toPointChange: TRANSACTION_TEST_DATA.pointsToEarn,
        participationId: TRANSACTION_TEST_DATA.participationId,
      });
      expect(TransactionRepository.create).toHaveBeenCalledWith(mockCtx, mockCreateInput, mockTx);
      expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(mockCtx, mockTx);
      expect(result).toBe(mockTransaction);
    });
  });

  describe("purchaseTicket", () => {
    it("should create transaction and refresh points", async () => {
      const mockTransaction = {
        id: "tx-6",
        createdAt: new Date(),
        updatedAt: null,
        reason: TransactionReason.TICKET_PURCHASED,
        participationId: null,
        from: "wallet-from",
        fromPointChange: 100,
        to: "wallet-to",
        toPointChange: 100,
      };
      const mockCreateInput = {
        ...TRANSACTION_INPUTS.purchaseTicket,
        transferPoints: 100,
        reason: TransactionReason.TICKET_PURCHASED,
      };

      mockFunctions.convertPurchaseTicket(mockCreateInput);
      mockFunctions.createTransaction(mockTransaction);

      const result = await TransactionService.purchaseTicket(mockCtx, mockTx, {
        ...TRANSACTION_INPUTS.purchaseTicket,
        transferPoints: 100,
      });

      expect(TransactionConverter.purchaseTicket).toHaveBeenCalledWith({
        ...TRANSACTION_INPUTS.purchaseTicket,
        transferPoints: 100,
      });
      expect(TransactionRepository.create).toHaveBeenCalledWith(mockCtx, mockCreateInput, mockTx);
      expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(mockCtx, mockTx);
      expect(result).toBe(mockTransaction);
    });
  });
});
