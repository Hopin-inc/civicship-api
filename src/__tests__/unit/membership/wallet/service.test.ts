import { Prisma, WalletType } from "@prisma/client";
import WalletService from "@/application/membership/wallet/service";
import WalletRepository from "@/application/membership/wallet/data/repository";
import { NotFoundError } from "@/errors/graphql";
import { IContext } from "@/types/server";
import WalletConverter from "@/application/membership/wallet/data/converter";

jest.mock("@/application/membership/wallet/data/repository");
jest.mock("@/application/membership/wallet/data/converter");

describe("WalletService", () => {
  const mockCtx = {} as IContext;
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
  });

  describe("fetchWallets", () => {
    it("should return all wallets", async () => {
      // [1] モックデータ
      const wallets = [memberWallet, communityWallet];

      // [2] Repository.query をモック
      (WalletRepository.query as jest.Mock).mockResolvedValue(wallets);

      // [3] 実行
      const filter = {};
      const sort = {};
      const take = 10;
      const cursor = undefined;

      const result = await WalletService.fetchWallets(mockCtx, { filter, sort, cursor }, take);

      const where = WalletConverter.filter({});
      const orderBy = WalletConverter.sort({});

      // [4] 検証
      expect(WalletRepository.query).toHaveBeenCalledWith(mockCtx, where, orderBy, take, cursor);
      expect(result).toEqual(wallets);
    });
  });

  describe("findWallet", () => {
    it("should return the wallet if found", async () => {
      (WalletRepository.find as jest.Mock).mockResolvedValue(baseWallet);

      const result = await WalletService.findWallet(mockCtx, walletId);

      expect(WalletRepository.find).toHaveBeenCalledWith(mockCtx, walletId);
      expect(result).toEqual(baseWallet);
    });

    it("should return null if not found", async () => {
      (WalletRepository.find as jest.Mock).mockResolvedValue(null);

      const result = await WalletService.findWallet(mockCtx, walletId);

      expect(WalletRepository.find).toHaveBeenCalledWith(mockCtx, walletId);
      expect(result).toBeNull();
    });
  });

  describe("findMemberWalletOrThrow", () => {
    it("should return the member wallet if found", async () => {
      // [2] Repository / Presenter のモック
      (WalletRepository.findFirstExistingMemberWallet as jest.Mock).mockResolvedValue(memberWallet);

      // [3] 実行
      const result = await WalletService.findMemberWalletOrThrow(
        mockCtx,
        userId,
        communityId,
        mockTx,
      );

      // [4] 検証
      expect(WalletRepository.findFirstExistingMemberWallet).toHaveBeenCalledWith(
        mockCtx,
        communityId,
        userId,
        mockTx,
      );
      expect(result).toEqual(memberWallet);
    });

    it("should throw NotFoundError if wallet does not exist", async () => {
      // [1] Repository が null を返すようモック
      (WalletRepository.findFirstExistingMemberWallet as jest.Mock).mockResolvedValue(null);

      // [2] 実行・検証
      await expect(
        WalletService.findMemberWalletOrThrow(mockCtx, userId, communityId, mockTx),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("findCommunityWalletOrThrow", () => {
    it("should return the community wallet if found", async () => {
      (WalletRepository.findCommunityWallet as jest.Mock).mockResolvedValue(communityWallet);

      // [3] 実行
      const result = await WalletService.findCommunityWalletOrThrow(mockCtx, communityId);

      // [4] 検証
      expect(WalletRepository.findCommunityWallet).toHaveBeenCalledWith(mockCtx, communityId);
      expect(result).toEqual(communityWallet);
    });

    it("should throw NotFoundError if no community wallet is found", async () => {
      // [1] Repository が null を返す
      (WalletRepository.findCommunityWallet as jest.Mock).mockResolvedValue(null);

      // [2] 検証
      await expect(WalletService.findCommunityWalletOrThrow(mockCtx, communityId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("checkIfMemberWalletExists", () => {
    it("should return the wallet if found", async () => {
      // [2] Repository / Presenter のモック設定
      (WalletRepository.find as jest.Mock).mockResolvedValue(memberWallet);

      // [3] 実行
      const result = await WalletService.checkIfMemberWalletExists(mockCtx, walletId);

      // [4] 検証
      expect(WalletRepository.find).toHaveBeenCalledWith(mockCtx, walletId);
      expect(result).toEqual(memberWallet);
    });

    it("should throw NotFoundError if wallet does not exist", async () => {
      // [1] Repository が null を返す
      (WalletRepository.find as jest.Mock).mockResolvedValue(null);

      // [2] 検証
      await expect(WalletService.checkIfMemberWalletExists(mockCtx, walletId)).rejects.toThrow(
        NotFoundError,
      );
    });

    const mockCreateInput = {
      community: { connect: { id: communityId } },
      type: WalletType.COMMUNITY,
    };

    it("should create a community wallet", async () => {
      jest.mocked(WalletConverter.createCommunityWallet).mockReturnValue(mockCreateInput);
      (WalletRepository.create as jest.Mock).mockResolvedValue(communityWallet);

      const result = await WalletService.createCommunityWallet(mockCtx, communityId, mockTx);

      expect(WalletConverter.createCommunityWallet).toHaveBeenCalledWith({ communityId });
      expect(WalletRepository.create).toHaveBeenCalledWith(mockCtx, mockCreateInput, mockTx);
      expect(result).toEqual(communityWallet);
    });
  });

  describe("createMemberWalletIfNeeded", () => {
    const mockCreateInput = {
      user: { connect: { id: userId } },
      community: { connect: { id: communityId } },
      type: WalletType.MEMBER,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return existing member wallet if already exists", async () => {
      (WalletRepository.findFirstExistingMemberWallet as jest.Mock).mockResolvedValue(memberWallet);

      const result = await WalletService.createMemberWalletIfNeeded(
        mockCtx,
        userId,
        communityId,
        mockTx,
      );

      expect(WalletRepository.findFirstExistingMemberWallet).toHaveBeenCalledWith(
        mockCtx,
        communityId,
        userId,
        mockTx,
      );
      expect(WalletRepository.create).not.toHaveBeenCalled();
      expect(result).toStrictEqual(memberWallet);
    });

    it("should create and return member wallet if not exists", async () => {
      (WalletRepository.findFirstExistingMemberWallet as jest.Mock).mockResolvedValue(null);
      (WalletConverter.createMemberWallet as jest.Mock).mockReturnValue(mockCreateInput);
      (WalletRepository.create as jest.Mock).mockResolvedValue(baseWallet);

      const result = await WalletService.createMemberWalletIfNeeded(
        mockCtx,
        userId,
        communityId,
        mockTx,
      );

      expect(WalletRepository.findFirstExistingMemberWallet).toHaveBeenCalledWith(
        mockCtx,
        communityId,
        userId,
        mockTx,
      );
      expect(WalletConverter.createMemberWallet).toHaveBeenCalledWith({ userId, communityId });
      expect(WalletRepository.create).toHaveBeenCalledWith(mockCtx, mockCreateInput, mockTx);
      expect(result).toStrictEqual(baseWallet);
    });
  });

  describe("deleteMemberWallet", () => {
    it("should delete the member wallet if exists", async () => {
      jest.spyOn(WalletService, "findMemberWalletOrThrow").mockResolvedValue(memberWallet as any);
      (WalletRepository.delete as jest.Mock).mockResolvedValue(memberWallet);

      const result = await WalletService.deleteMemberWallet(mockCtx, userId, communityId, mockTx);

      expect(WalletService.findMemberWalletOrThrow).toHaveBeenCalledWith(
        mockCtx,
        communityId,
        userId,
        mockTx,
      );
      expect(WalletRepository.delete).toHaveBeenCalledWith(mockCtx, memberWallet.id);
      expect(result).toEqual(memberWallet);
    });

    it("should throw NotFoundError if wallet does not exist", async () => {
      jest
        .spyOn(WalletService, "findMemberWalletOrThrow")
        .mockRejectedValue(new NotFoundError("wallet not found"));

      await expect(
        WalletService.deleteMemberWallet(mockCtx, userId, communityId, mockTx),
      ).rejects.toThrow(NotFoundError);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
