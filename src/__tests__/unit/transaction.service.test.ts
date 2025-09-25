import "reflect-metadata";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { container } from "tsyringe";
import TransactionService from "@/application/domain/transaction/service";
import { ITransactionService } from "@/application/domain/transaction/data/interface";

jest.mock("@/application/domain/utils", () => ({
  getCurrentUserId: jest.fn().mockReturnValue("test-user-id"),
}));

class MockTransactionRepository {
  create = jest.fn();
  refreshCurrentPoints = jest.fn();
}

class MockTransactionConverter {
  issueCommunityPoint = jest.fn();
  grantCommunityPoint = jest.fn();
  donateSelfPoint = jest.fn();
  giveRewardPoint = jest.fn();
  purchaseTicket = jest.fn();
  refundTicket = jest.fn();
}

describe("TransactionService", () => {
  let mockRepository: MockTransactionRepository;
  let mockConverter: MockTransactionConverter;
  let mockService: ITransactionService;

  const mockCtx = {} as IContext;
  const mockTx = {} as Prisma.TransactionClient;
  const transferPoints = 100;
  const walletId = "wallet-1";
  const participationId = "participation-123";
  const comment = "test-comment";

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockRepository = new MockTransactionRepository();
    mockConverter = new MockTransactionConverter();

    container.register("TransactionRepository", { useValue: mockRepository });
    container.register("TransactionConverter", { useValue: mockConverter });
    container.register("TransactionService", { useClass: TransactionService });

    mockService = container.resolve(TransactionService);
  });

  describe("issueCommunityPoint", () => {
    it("should create transaction and refresh transferPoints", async () => {
      const mockTransaction = {
        id: "tx-1",
        reason: "POINT_ISSUED",
        fromPointChange: transferPoints,
        to: walletId,
        toPointChange: transferPoints,
      };

      const convertedData = {
        reason: "POINT_ISSUED",
        fromPointChange: transferPoints,
        to: walletId,
        toPointChange: transferPoints,
      };

      mockConverter.issueCommunityPoint.mockReturnValue(convertedData);
      mockRepository.create.mockResolvedValue(mockTransaction);
      mockRepository.refreshCurrentPoints.mockResolvedValue(undefined);

      const result = await mockService.issueCommunityPoint(
        mockCtx,
        transferPoints,
        walletId,
        mockTx,
        comment,
      );

      expect(mockConverter.issueCommunityPoint).toHaveBeenCalledWith(walletId, transferPoints, "test-user-id", comment);
      expect(mockRepository.create).toHaveBeenCalledWith(mockCtx, convertedData, mockTx);
      expect(mockRepository.refreshCurrentPoints).toHaveBeenCalledWith(mockCtx, mockTx);
      expect(result).toBe(mockTransaction);
    });
  });

  describe("grantCommunityPoint", () => {
    it("should create transaction and refresh transferPoints", async () => {
      const mockTransaction = {
        id: "tx-2",
        reason: "GRANT",
        fromPointChange: transferPoints,
        to: walletId,
        toPointChange: transferPoints,
      };

      const convertedData = {
        reason: "GRANT",
        fromPointChange: transferPoints,
        to: walletId,
        toPointChange: transferPoints,
      };

      mockConverter.grantCommunityPoint.mockReturnValue(convertedData);
      mockRepository.create.mockResolvedValue(mockTransaction);
      mockRepository.refreshCurrentPoints.mockResolvedValue(undefined);

      const result = await mockService.grantCommunityPoint(
        mockCtx,
        transferPoints,
        walletId,
        walletId,
        mockTx,
        comment,
      );

      expect(mockConverter.grantCommunityPoint).toHaveBeenCalledWith(
        walletId,
        transferPoints,
        walletId,
        "test-user-id",
        comment,
      );
      expect(mockRepository.create).toHaveBeenCalledWith(mockCtx, convertedData, mockTx);
      expect(mockRepository.refreshCurrentPoints).toHaveBeenCalledWith(mockCtx, mockTx);
      expect(result).toBe(mockTransaction);
    });
  });

  describe("donateSelfPoint", () => {
    it("should create transaction and refresh transferPoints", async () => {
      const mockTransaction = {
        id: "tx-3",
        reason: "DONATION",
        fromPointChange: transferPoints,
        to: walletId,
        toPointChange: transferPoints,
      };

      const convertedData = {
        reason: "DONATION",
        fromPointChange: transferPoints,
        to: walletId,
        toPointChange: transferPoints,
      };

      mockConverter.donateSelfPoint.mockReturnValue(convertedData);
      mockRepository.create.mockResolvedValue(mockTransaction);
      mockRepository.refreshCurrentPoints.mockResolvedValue(undefined);

      const result = await mockService.donateSelfPoint(
        mockCtx,
        walletId,
        walletId,
        transferPoints,
        mockTx,
        comment,
      );

      expect(mockConverter.donateSelfPoint).toHaveBeenCalledWith(
        walletId,
        walletId,
        transferPoints,
        "test-user-id",
        comment,
      );
      expect(mockRepository.create).toHaveBeenCalledWith(mockCtx, convertedData, mockTx);
      expect(mockRepository.refreshCurrentPoints).toHaveBeenCalledWith(mockCtx, mockTx);
      expect(result).toBe(mockTransaction);
    });
  });

  describe("giveRewardPoint", () => {
    it("should create transaction and refresh transferPoints", async () => {
      const mockTransaction = {
        id: "tx-4",
        reason: "POINT_REWARD",
        participationId,
        fromPointChange: -transferPoints,
        to: walletId,
        toPointChange: transferPoints,
      };

      const convertedData = {
        reason: "POINT_REWARD",
        participationId,
        fromPointChange: -transferPoints,
        to: walletId,
        toPointChange: transferPoints,
      };

      mockConverter.giveRewardPoint.mockReturnValue(convertedData);
      mockRepository.create.mockResolvedValue(mockTransaction);
      mockRepository.refreshCurrentPoints.mockResolvedValue(undefined);

      const result = await mockService.giveRewardPoint(
        mockCtx,
        mockTx,
        participationId,
        transferPoints,
        walletId,
        walletId,
      );

      expect(mockConverter.giveRewardPoint).toHaveBeenCalledWith(
        walletId,
        walletId,
        participationId,
        transferPoints,
        "test-user-id",
      );
      expect(mockRepository.create).toHaveBeenCalledWith(mockCtx, convertedData, mockTx);
      expect(mockRepository.refreshCurrentPoints).toHaveBeenCalledWith(mockCtx, mockTx);
      expect(result).toBe(mockTransaction);
    });
  });

  describe("purchaseTicket", () => {
    it("should create transaction and refresh transferPoints", async () => {
      const mockTransaction = {
        id: "tx-5",
        reason: "TICKET_PURCHASED",
        fromPointChange: transferPoints,
        to: walletId,
        toPointChange: transferPoints,
      };

      const convertedData = {
        reason: "TICKET_PURCHASED",
        fromPointChange: transferPoints,
        to: walletId,
        toPointChange: transferPoints,
      };

      mockConverter.purchaseTicket.mockReturnValue(convertedData);
      mockRepository.create.mockResolvedValue(mockTransaction);
      mockRepository.refreshCurrentPoints.mockResolvedValue(undefined);

      const result = await mockService.purchaseTicket(
        mockCtx,
        mockTx,
        walletId,
        walletId,
        transferPoints,
      );

      expect(mockConverter.purchaseTicket).toHaveBeenCalledWith(walletId, walletId, transferPoints, "test-user-id");
      expect(mockRepository.create).toHaveBeenCalledWith(mockCtx, convertedData, mockTx);
      expect(mockRepository.refreshCurrentPoints).toHaveBeenCalledWith(mockCtx, mockTx);
      expect(result).toBe(mockTransaction);
    });
  });

  describe("refundTicket", () => {
    it("should create transaction and refresh transferPoints", async () => {
      const mockTransaction = {
        id: "tx-6",
        reason: "TICKET_REFUNDED",
        fromPointChange: transferPoints,
        to: walletId,
        toPointChange: transferPoints,
      };

      const convertedData = {
        reason: "TICKET_REFUNDED",
        fromPointChange: transferPoints,
        to: walletId,
        toPointChange: transferPoints,
      };

      mockConverter.refundTicket.mockReturnValue(convertedData);
      mockRepository.create.mockResolvedValue(mockTransaction);
      mockRepository.refreshCurrentPoints.mockResolvedValue(undefined);

      const result = await mockService.refundTicket(
        mockCtx,
        mockTx,
        walletId,
        walletId,
        transferPoints,
      );

      expect(mockConverter.refundTicket).toHaveBeenCalledWith(walletId, walletId, transferPoints, "test-user-id");
      expect(mockRepository.create).toHaveBeenCalledWith(mockCtx, convertedData, mockTx);
      expect(mockRepository.refreshCurrentPoints).toHaveBeenCalledWith(mockCtx, mockTx);
      expect(result).toBe(mockTransaction);
    });
  });
});
