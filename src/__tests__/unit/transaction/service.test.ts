import { IContext } from "@/types/server";
import { Prisma, TransactionReason } from "@prisma/client";
import TransactionConverter from "@/application/domain/transaction/data/converter";
import TransactionRepository from "@/application/domain/transaction/data/repository";
import TransactionService from "@/application/domain/transaction/service";

jest.mock("@/application/domain/transaction/data/repository");
jest.mock("@/application/domain/transaction/data/converter");

describe("TransactionService", () => {
  const mockCtx = {} as IContext;
  const mockTx = {} as Prisma.TransactionClient;
  const fromWalletId = "wallet-from";
  const toWalletId = "wallet-to";

  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("issueCommunityPoint", () => {
    it("should create transaction and refresh points", async () => {
      const input = {
        communityId: "community-1",
        to: "user-1",
        toWalletId: "wallet-1",
        fromPointChange: -100,
        toPointChange: 100,
        reason: TransactionReason.POINT_ISSUED,
      };

      const mockCreateInput = { ...input }; // Converterの戻り値
      const mockResult = { id: "tx-xyz" }; // Repositoryの戻り値

      // [1] Converterモック
      jest.mocked(TransactionConverter.issueCommunityPoint).mockReturnValue(mockCreateInput);

      // [2] Repositoryモック
      (TransactionRepository.create as jest.Mock).mockResolvedValue(mockResult);

      // [3] 実行
      const result = await TransactionService.issueCommunityPoint(mockCtx, input);

      // [4] 検証
      expect(TransactionConverter.issueCommunityPoint).toHaveBeenCalledWith(input);
      expect(TransactionRepository.create).toHaveBeenCalledWith(mockCtx, mockCreateInput);
      expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(mockCtx);
      expect(result).toBe(mockResult);
    });
  });

  describe("grantCommunityPoint", () => {
    it("should create transaction and refresh points", async () => {
      // [1] 元の GraphQL input（Serviceの引数）
      const input = {
        communityId: "community-1",
        toPointChange: 200,
        fromPointChange: -200,
        fromWalletId: "wallet-2",
        toWalletId: "wallet-1",
        toUserId: "user-1",
        reason: TransactionReason.GRANT,
      };
      const memberWalletId = "wallet-2";

      // [2] Converter が構築する Prisma 用の input
      const mockCreateInput = {
        ...input,
      };

      // [3] Repository が返すデータ
      const mockTransaction = { id: "tx-2", reason: TransactionReason.GRANT };

      // [4] モック設定
      jest.mocked(TransactionConverter.grantCommunityPoint).mockReturnValue(mockCreateInput);
      (TransactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);

      // [5] 実行
      const result = await TransactionService.grantCommunityPoint(
        mockCtx,
        input,
        memberWalletId,
        mockTx,
      );

      // [6] 検証
      expect(TransactionConverter.grantCommunityPoint).toHaveBeenCalledWith(input, memberWalletId);
      expect(TransactionRepository.create).toHaveBeenCalledWith(mockCtx, mockCreateInput, mockTx);
      expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(mockCtx, mockTx);
      expect(result).toBe(mockTransaction);
    });
  });

  describe("donateSelfPoint", () => {
    it("should create transaction and refresh points", async () => {
      // [1] GraphQL Input
      const input = {
        communityId: "community-1",
        toPointChange: 200,
        fromPointChange: -200,
        fromWalletId: "wallet-2",
        toWalletId: "wallet-1",
        toUserId: "user-1",
      };

      const toWalletId = "wallet-2";

      // [2] Converter の返す Prisma TransactionCreateInput
      const prismaCreateInput = {
        ...input,
        reason: TransactionReason.DONATION,
      };

      // [3] Repository の返却する mock transaction
      const mockTransaction = {
        id: "tx-3",
        ...prismaCreateInput,
      };

      // [4] Converter モック設定
      jest.mocked(TransactionConverter.donateSelfPoint).mockReturnValue(prismaCreateInput);

      // [5] Repository モック設定
      (TransactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);

      // [6] 実行
      const result = await TransactionService.donateSelfPoint(mockCtx, input, toWalletId, mockTx);

      // [7] アサーション
      expect(TransactionConverter.donateSelfPoint).toHaveBeenCalledWith(input, toWalletId);
      expect(TransactionRepository.create).toHaveBeenCalledWith(mockCtx, prismaCreateInput, mockTx);
      expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(mockCtx, mockTx);
      expect(result).toBe(mockTransaction);
    });
  });

  describe("giveOnboardingPoint", () => {
    it("should create onboarding transaction and refresh points", async () => {
      // [1] パラメータ入力（UseCase層から渡ってくる input）
      const input = {
        communityId: "community-1",
        userId: "user-1",
        toWalletId: "wallet-3",
        fromWalletId: "wallet-2",
        fromPointChange: -300,
        toPointChange: 300,
      };

      // [2] Converter が生成する Prisma用 create input
      const prismaCreateInput = {
        ...input,
        reason: TransactionReason.ONBOARDING,
      };

      // [3] Repository.create が返す mock transaction
      const mockTransaction = {
        id: "tx-4",
        ...prismaCreateInput,
      };

      // [4] Converter の振る舞いをモック
      jest.mocked(TransactionConverter.giveOnboardingPoint).mockReturnValue(prismaCreateInput);

      // [5] Repository の戻り値モック
      (TransactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);

      // [6] 実行
      const result = await TransactionService.giveOnboardingPoint(mockCtx, input, mockTx);

      // [7] アサーション
      expect(TransactionConverter.giveOnboardingPoint).toHaveBeenCalledWith(input);
      expect(TransactionRepository.create).toHaveBeenCalledWith(mockCtx, prismaCreateInput, mockTx);
      expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(mockCtx, mockTx);
      expect(result).toBe(mockTransaction);
    });
  });

  describe("giveRewardPoint", () => {
    it("should create a reward transaction and refresh points", async () => {
      // [1] 引数
      const participationId = "participation-123";
      const input = {
        communityId: "community-1",
        userId: "user-1",
        toWalletId: "wallet-3",
        fromWalletId: "wallet-2",
        fromPointChange: -300,
        toPointChange: 300,
      };
      const pointsToEarn = 100;

      // [2] Converter の出力（Prisma用 input）
      const prismaCreateInput = {
        ...input,
        reason: TransactionReason.POINT_REWARD,
      };

      // [3] Repository が返すトランザクション
      const mockTransaction = { id: "tx-123", ...prismaCreateInput };

      // [4] Converter をモック
      jest.spyOn(TransactionConverter, "giveRewardPoint").mockReturnValue(prismaCreateInput);

      // [5] Repository をモック
      (TransactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);

      // [6] 実行
      const result = await TransactionService.giveRewardPoint(
        mockCtx,
        mockTx,
        participationId,
        pointsToEarn,
        fromWalletId,
        toWalletId,
      );

      // [7] アサーション
      expect(TransactionConverter.giveRewardPoint).toHaveBeenCalledWith({
        fromWalletId,
        fromPointChange: -pointsToEarn,
        toWalletId,
        toPointChange: pointsToEarn,
        participationId,
      });
      expect(TransactionRepository.create).toHaveBeenCalledWith(mockCtx, prismaCreateInput, mockTx);
      expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(mockCtx, mockTx);
      expect(result).toBe(mockTransaction);
    });
  });

  describe("purchaseTicket", () => {
    it("should create transaction for ticket purchase and refresh points", async () => {
      // [1] ユースケースから渡される input
      const input = {
        userId: "user-123",
        communityId: "community-123",
        opportunityId: "opp-123",
        fromWalletId: "wallet-1",
        toWalletId: "wallet-2",
        fromPointChange: -200,
        toPointChange: 200,
        transferPoints: 200,
      };

      // [2] Converter が生成する Prisma input
      const prismaCreateInput = {
        ...input,
        reason: TransactionReason.TICKET_PURCHASED,
      };

      // [3] Repository の返却値
      const mockTransaction = { id: "tx-6", ...prismaCreateInput };

      // [4] モック設定
      jest.mocked(TransactionConverter.purchaseTicket).mockReturnValue(prismaCreateInput);
      (TransactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);

      // [5] 実行
      const result = await TransactionService.purchaseTicket(mockCtx, mockTx, input);

      // [6] アサーション
      expect(TransactionConverter.purchaseTicket).toHaveBeenCalledWith(input);
      expect(TransactionRepository.create).toHaveBeenCalledWith(mockCtx, prismaCreateInput, mockTx);
      expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(mockCtx, mockTx);
      expect(result).toBe(mockTransaction);
    });
  });

  describe("refundTicket", () => {
    it("should create transaction for ticket refund and refresh points", async () => {
      // [1] サービスに渡される input（ドメイン的な意味を持つ引数）
      const input = {
        userId: "user-123",
        communityId: "community-123",
        opportunityId: "opp-123",
        toWalletId: "wallet-1",
        fromWalletId: "wallet-2",
        fromPointChange: -200,
        toPointChange: 200,
        transferPoints: -200,
      };

      // [2] Converter が返す Prisma 用の input（TransactionCreateInput）
      const prismaCreateInput = {
        ...input,
        reason: TransactionReason.TICKET_REFUNDED,
      };

      // [3] Repository が返すトランザクション結果（id 付き）
      const mockTransaction = { id: "tx-7", ...prismaCreateInput };

      // [4] Converter の戻り値をモック
      jest.mocked(TransactionConverter.refundTicket).mockReturnValue(prismaCreateInput);

      // [5] Repository の戻り値をモック
      (TransactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);

      // [6] テスト対象の実行
      const result = await TransactionService.refundTicket(mockCtx, mockTx, input);

      // [7] アサーション（Converter → Repository → refresh → 戻り値）
      expect(TransactionConverter.refundTicket).toHaveBeenCalledWith(input);
      expect(TransactionRepository.create).toHaveBeenCalledWith(mockCtx, prismaCreateInput, mockTx);
      expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(mockCtx, mockTx);
      expect(result).toBe(mockTransaction);
    });
  });
});
