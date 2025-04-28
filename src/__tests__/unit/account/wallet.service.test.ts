import { Prisma, WalletType } from "@prisma/client";
import WalletService from "@/application/domain/account/wallet/service";
import { NotFoundError } from "@/errors/graphql";
import { IContext } from "@/types/server";
import { IWalletRepository } from "@/application/domain/account/wallet/data/interface";

export class MockWalletRepository implements IWalletRepository {
  query = jest.fn();
  find = jest.fn();
  findCommunityWallet = jest.fn();
  findFirstExistingMemberWallet = jest.fn();
  create = jest.fn();
  delete = jest.fn();
}

export class MockWalletConverter {
  filter = jest.fn();
  sort = jest.fn();
  createCommunityWallet = jest.fn();
  createMemberWallet = jest.fn();
}

describe("WalletService", () => {
  let mockRepository: MockWalletRepository;
  let mockConverter: MockWalletConverter;
  let walletService: WalletService;

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
    mockRepository = new MockWalletRepository();
    mockConverter = new MockWalletConverter();
    walletService = new WalletService(mockRepository, mockConverter);
    jest.clearAllMocks();
  });

  describe("fetchWallets", () => {
    it("should return all wallets", async () => {
      mockRepository.query.mockResolvedValue([memberWallet, communityWallet]);
      mockConverter.filter.mockReturnValue({});
      mockConverter.sort.mockReturnValue({});

      const result = await walletService.fetchWallets(
        mockCtx,
        { filter: {}, sort: {}, cursor: undefined },
        10,
      );

      expect(mockRepository.query).toHaveBeenCalledWith(mockCtx, {}, {}, 10, undefined);
      expect(result).toEqual([memberWallet, communityWallet]);
    });
  });

  describe("findWallet", () => {
    it("should return the wallet if found", async () => {
      mockRepository.find.mockResolvedValue(baseWallet);

      const result = await walletService.findWallet(mockCtx, walletId);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, walletId);
      expect(result).toEqual(baseWallet);
    });

    it("should return null if not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      const result = await walletService.findWallet(mockCtx, walletId);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, walletId);
      expect(result).toBeNull();
    });
  });

  describe("findMemberWalletOrThrow", () => {
    it("should return the member wallet if found", async () => {
      mockRepository.findFirstExistingMemberWallet.mockResolvedValue(memberWallet);

      const result = await walletService.findMemberWalletOrThrow(mockCtx, userId, communityId);

      expect(mockRepository.findFirstExistingMemberWallet).toHaveBeenCalledWith(
        mockCtx,
        communityId,
        userId,
      );
      expect(result).toEqual(memberWallet);
    });

    it("should throw NotFoundError if wallet does not exist", async () => {
      mockRepository.findFirstExistingMemberWallet.mockResolvedValue(null);

      await expect(
        walletService.findMemberWalletOrThrow(mockCtx, userId, communityId),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("findCommunityWalletOrThrow", () => {
    it("should return the community wallet if found", async () => {
      mockRepository.findCommunityWallet.mockResolvedValue(communityWallet);

      const result = await walletService.findCommunityWalletOrThrow(mockCtx, communityId);

      expect(mockRepository.findCommunityWallet).toHaveBeenCalledWith(mockCtx, communityId);
      expect(result).toEqual(communityWallet);
    });

    it("should throw NotFoundError if no community wallet is found", async () => {
      mockRepository.findCommunityWallet.mockResolvedValue(null);

      await expect(walletService.findCommunityWalletOrThrow(mockCtx, communityId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("checkIfMemberWalletExists", () => {
    it("should return the wallet if found", async () => {
      mockRepository.find.mockResolvedValue(memberWallet);

      const result = await walletService.checkIfMemberWalletExists(mockCtx, walletId);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, walletId);
      expect(result).toEqual(memberWallet);
    });

    it("should throw NotFoundError if wallet does not exist", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(walletService.checkIfMemberWalletExists(mockCtx, walletId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("createCommunityWallet", () => {
    it("should create a community wallet", async () => {
      const createInput = {
        type: WalletType.COMMUNITY,
        community: { connect: { id: communityId } },
      };
      mockConverter.createCommunityWallet.mockReturnValue(createInput);
      mockRepository.create.mockResolvedValue(communityWallet);

      const result = await walletService.createCommunityWallet(mockCtx, communityId, mockTx);

      expect(mockConverter.createCommunityWallet).toHaveBeenCalledWith({ communityId });
      expect(mockRepository.create).toHaveBeenCalledWith(mockCtx, createInput, mockTx);
      expect(result).toEqual(communityWallet);
    });
  });

  describe("createMemberWalletIfNeeded", () => {
    it("should return existing member wallet if exists", async () => {
      mockRepository.findFirstExistingMemberWallet.mockResolvedValue(memberWallet);

      const result = await walletService.createMemberWalletIfNeeded(
        mockCtx,
        userId,
        communityId,
        mockTx,
      );

      expect(mockRepository.findFirstExistingMemberWallet).toHaveBeenCalledWith(
        mockCtx,
        communityId,
        userId,
      );
      expect(result).toEqual(memberWallet);
    });

    it("should create new member wallet if not exists", async () => {
      const createInput = {
        type: WalletType.MEMBER,
        community: { connect: { id: communityId } },
        user: { connect: { id: userId } },
      };
      mockRepository.findFirstExistingMemberWallet.mockResolvedValue(null);
      mockConverter.createMemberWallet.mockReturnValue(createInput);
      mockRepository.create.mockResolvedValue(memberWallet);

      const result = await walletService.createMemberWalletIfNeeded(
        mockCtx,
        userId,
        communityId,
        mockTx,
      );

      expect(mockConverter.createMemberWallet).toHaveBeenCalledWith({ userId, communityId });
      expect(mockRepository.create).toHaveBeenCalledWith(mockCtx, createInput, mockTx);
      expect(result).toEqual(memberWallet);
    });
  });

  describe("deleteMemberWallet", () => {
    it("should delete the member wallet", async () => {
      mockRepository.findFirstExistingMemberWallet.mockResolvedValue(memberWallet);
      mockRepository.delete.mockResolvedValue(memberWallet);

      const result = await walletService.deleteMemberWallet(mockCtx, userId, communityId, mockTx);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockCtx, memberWallet.id, mockTx);
      expect(result).toEqual(memberWallet);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
