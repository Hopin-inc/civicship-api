import { MembershipStatus, MembershipStatusReason, Prisma, Role } from "@prisma/client";
import MembershipRepository from "@/application/domain/account/membership/data/repository";
import MembershipService from "@/application/domain/account/membership/service";
import MembershipConverter from "@/application/domain/account/membership/data/converter";
import { getCurrentUserId } from "@/application/domain/utils";
import { NotFoundError } from "@/errors/graphql";
import { IContext } from "@/types/server";

jest.mock("@/application/domain/account/membership/data/repository", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    query: jest.fn(),
  },
}));

jest.mock("@/application/domain/account/membership/data/converter", () => ({
  __esModule: true,
  default: {
    filter: jest.fn(),
    sort: jest.fn(),
    cursor: jest.fn(),
    invite: jest.fn(),
    join: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("@/application/domain/utils", () => ({
  __esModule: true,
  getCurrentUserId: jest.fn(),
}));

describe("MembershipService", () => {
  const mockCtx = {} as IContext;
  const mockTx = {} as Prisma.TransactionClient;
  const userId = "user123";
  const communityId = "community123";
  const baseMembership = {
    userId,
    communityId,
    role: Role.MEMBER,
    createdAt: new Date("2024-01-01"),
    updatedAt: null,
  };
  const identifier = { userId_communityId: { userId, communityId } };

  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrentUserId as jest.Mock).mockReturnValue("adminUser");
  });

  describe("fetchMembership", () => {
    it("should return all memberships", async () => {
      // [1] モックデータ
      const memberships = [
        {
          ...baseMembership,
          status: MembershipStatus.JOINED,
          reason: MembershipStatusReason.ACCEPTED_INVITATION,
        },
      ];

      // [2] Repository.query をモック
      (MembershipRepository.query as jest.Mock).mockResolvedValue(memberships);

      // [3] 実行
      const filter = {};
      const sort = {};
      const limit = 10;
      const cursor = undefined;

      const result = await MembershipService.fetchMemberships(
        mockCtx,
        { filter, sort, cursor },
        limit,
      );

      const where = MembershipConverter.filter({});
      const orderBy = MembershipConverter.sort({});

      // [4] 検証
      expect(MembershipRepository.query).toHaveBeenCalledWith(
        mockCtx,
        where,
        orderBy,
        limit,
        cursor,
      );
      expect(result).toEqual(memberships);
    });
  });

  describe("findMembership", () => {
    it("should return a membership if found", async () => {
      // [1] 期待される既存のメンバーシップをモック
      const existingMembership = {
        ...baseMembership,
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.ACCEPTED_INVITATION,
      };

      // [2] Repository.find のモック設定
      (MembershipRepository.find as jest.Mock).mockResolvedValue(existingMembership);

      // [3] 実行
      const result = await MembershipService.findMembership(mockCtx, userId, communityId);

      // [4] 検証
      expect(MembershipRepository.find).toHaveBeenCalledWith(mockCtx, {
        userId_communityId: { userId, communityId },
      });
      expect(result).toEqual(existingMembership);
    });
  });

  describe("inviteMember", () => {
    it("should create a new membership", async () => {
      const mockCreateInput = {
        user: { connect: { id: userId } },
        community: { connect: { id: communityId } },
        role: Role.MEMBER,
        status: MembershipStatus.PENDING,
        reason: MembershipStatusReason.INVITED,
      };

      const mockCreated = {
        ...baseMembership,
        status: MembershipStatus.PENDING,
        reason: MembershipStatusReason.INVITED,
      };

      jest.mocked(MembershipConverter.invite).mockReturnValue(mockCreateInput);
      (MembershipRepository.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await MembershipService.inviteMember(mockCtx, {
        userId,
        communityId,
        role: Role.MEMBER,
      });

      expect(MembershipConverter.invite).toHaveBeenCalledWith(
        userId,
        communityId,
        "adminUser",
        Role.MEMBER,
      );
      expect(MembershipRepository.create).toHaveBeenCalledWith(mockCtx, mockCreateInput);
      expect(result).toEqual(mockCreated);
    });
  });

  describe("joinIfNeeded", () => {
    it("should create membership if not found", async () => {
      // [1] DB上には Membership が存在しない前提
      (MembershipRepository.find as jest.Mock).mockResolvedValue(null);

      // [2] Converter が生成する Prisma用の create input（MembershipCreateInput）
      const createInput = {
        user: { connect: { id: userId } },
        community: { connect: { id: communityId } },
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.ACCEPTED_INVITATION,
        histories: {
          create: {
            status: MembershipStatus.JOINED,
            reason: MembershipStatusReason.ACCEPTED_INVITATION,
            createdByUser: { connect: { id: "adminUser" } },
          },
        },
      };

      // [3] Repository.create が返す Membership エンティティ（DB挿入後の状態）
      const createdMembership = {
        ...baseMembership,
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.ACCEPTED_INVITATION,
      };

      // [4] Converterの振る舞いをモック
      jest.mocked(MembershipConverter.join).mockReturnValue(createInput);

      // [5] Repository.createの戻り値をモック
      (MembershipRepository.create as jest.Mock).mockResolvedValue(createdMembership);

      // [6] テスト対象：Membershipが存在しない場合は create が呼ばれる
      const result = await MembershipService.joinIfNeeded(
        mockCtx,
        "adminUser", // currentUserId
        communityId,
        mockTx,
        userId, // joinedUserId
      );

      // [7] 検証：find → join（Converter）→ create の順で呼ばれているか
      expect(MembershipRepository.find).toHaveBeenCalledWith(mockCtx, identifier, mockTx);
      expect(MembershipConverter.join).toHaveBeenCalledWith("adminUser", communityId, userId);
      expect(MembershipRepository.create).toHaveBeenCalledWith(mockCtx, createInput, mockTx);
      expect(result).toEqual(createdMembership);
    });

    it("should update status if membership exists but not joined", async () => {
      // [1] 既存 membership を定義
      const existingMembership = {
        ...baseMembership,
        status: MembershipStatus.PENDING,
        reason: MembershipStatusReason.INVITED,
      };

      // [2] Converter から返る更新用データ
      const updateInput = {
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.ACCEPTED_INVITATION,
        role: Role.MEMBER,
        histories: {
          create: {
            status: MembershipStatus.JOINED,
            reason: MembershipStatusReason.ACCEPTED_INVITATION,
            role: Role.MEMBER,
            createdByUser: { connect: { id: "adminUser" } },
          },
        },
      };

      // [3] Repository.update が返す最終的な membership
      const updatedMembership = {
        ...existingMembership,
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.ACCEPTED_INVITATION,
        updatedAt: new Date("2025-03-25"),
      };

      // [4] モックの設定
      (MembershipRepository.find as jest.Mock).mockResolvedValue(existingMembership);
      jest.mocked(MembershipConverter.update).mockReturnValue(updateInput);
      (MembershipRepository.update as jest.Mock).mockResolvedValue(updatedMembership);

      // [5] テスト対象の実行
      const result = await MembershipService.joinIfNeeded(
        mockCtx,
        "adminUser",
        communityId,
        mockTx,
        userId,
      );

      // [6] アサーション
      expect(MembershipRepository.find).toHaveBeenCalledWith(mockCtx, identifier, mockTx);
      expect(MembershipConverter.update).toHaveBeenCalledWith(
        MembershipStatus.JOINED,
        MembershipStatusReason.ACCEPTED_INVITATION,
        Role.MEMBER,
        "adminUser",
      );
      expect(MembershipRepository.update).toHaveBeenCalledWith(
        mockCtx,
        identifier,
        updateInput,
        mockTx,
      );
      expect(result).toEqual(updatedMembership);
    });
  });

  describe("setStatus", () => {
    it("should update membership status with correct reason", async () => {
      // [1] 既存メンバーシップのモック
      const existingMembership = {
        ...baseMembership,
        status: MembershipStatus.PENDING,
        reason: MembershipStatusReason.INVITED,
      };

      // [2] Converter.update の戻り値を定義
      const updateInput = {
        status: MembershipStatus.LEFT,
        reason: MembershipStatusReason.WITHDRAWN,
        role: Role.MEMBER,
        histories: {
          create: {
            status: MembershipStatus.LEFT,
            reason: MembershipStatusReason.WITHDRAWN,
            role: Role.MEMBER,
            createdByUser: { connect: { id: "adminUser" } },
          },
        },
      };

      // [3] Repository.update の戻り値
      const updatedMembership = {
        ...existingMembership,
        ...updateInput,
        updatedAt: new Date(),
      };

      // [4] 各モック設定
      (MembershipRepository.find as jest.Mock).mockResolvedValue(existingMembership);
      jest.mocked(MembershipConverter.update).mockReturnValue(updateInput);
      (MembershipRepository.update as jest.Mock).mockResolvedValue(updatedMembership);

      // [5] 実行
      const result = await MembershipService.setStatus(
        mockCtx,
        { userId, communityId },
        MembershipStatus.LEFT,
        MembershipStatusReason.WITHDRAWN,
      );

      // [6] 検証
      expect(MembershipRepository.find).toHaveBeenCalledWith(mockCtx, identifier);
      expect(MembershipConverter.update).toHaveBeenCalledWith(
        MembershipStatus.LEFT,
        MembershipStatusReason.WITHDRAWN,
        Role.MEMBER,
        "adminUser",
      );
      expect(MembershipRepository.update).toHaveBeenCalledWith(mockCtx, identifier, updateInput);
      expect(result).toEqual(updatedMembership);
    });

    it("should throw NotFoundError if membership does not exist", async () => {
      jest.mocked(MembershipRepository.find).mockResolvedValue(null);

      await expect(
        MembershipService.setStatus(
          mockCtx,
          { userId, communityId },
          MembershipStatus.LEFT,
          MembershipStatusReason.WITHDRAWN,
        ),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("setRole", () => {
    it("should update the role if membership exists", async () => {
      // [1] 既存の membership のモックデータ
      const existingMembership = {
        ...baseMembership,
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.ACCEPTED_INVITATION,
      };

      // [2] Converter.update の戻り値
      const updateInput = {
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.ASSIGNED,
        role: Role.MANAGER,
        histories: {
          create: {
            status: MembershipStatus.JOINED,
            reason: MembershipStatusReason.ASSIGNED,
            role: Role.MANAGER,
            createdByUser: { connect: { id: "adminUser" } },
          },
        },
      };

      // [3] Repository.update の戻り値
      const updatedMembership = {
        ...existingMembership,
        ...updateInput,
        updatedAt: new Date(),
      };

      // [4] 各モック設定
      (MembershipRepository.find as jest.Mock).mockResolvedValue(existingMembership);
      jest.mocked(MembershipConverter.update).mockReturnValue(updateInput);
      (MembershipRepository.update as jest.Mock).mockResolvedValue(updatedMembership);

      // [5] 実行
      const result = await MembershipService.setRole(
        mockCtx,
        { userId, communityId },
        Role.MANAGER,
      );

      // [6] 検証
      expect(MembershipRepository.find).toHaveBeenCalledWith(mockCtx, identifier);
      expect(MembershipConverter.update).toHaveBeenCalledWith(
        MembershipStatus.JOINED,
        MembershipStatusReason.ASSIGNED,
        Role.MANAGER,
        "adminUser",
      );
      expect(MembershipRepository.update).toHaveBeenCalledWith(mockCtx, identifier, updateInput);
      expect(result).toEqual(updatedMembership);
    });

    it("should throw NotFoundError if membership does not exist", async () => {
      (MembershipRepository.find as jest.Mock).mockResolvedValue(null);

      await expect(
        MembershipService.setRole(mockCtx, { userId, communityId }, Role.MANAGER),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteMembership", () => {
    it("should delete membership if found", async () => {
      // [1] 削除対象の既存メンバーシップを定義
      const existingMembership = {
        ...baseMembership,
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.ACCEPTED_INVITATION,
      };

      // [2] Repository.find のモック設定
      (MembershipRepository.find as jest.Mock).mockResolvedValue(existingMembership);

      // [3] Repository.delete のモック設定
      (MembershipRepository.delete as jest.Mock).mockResolvedValue(existingMembership);

      // [4] 実行
      const result = await MembershipService.deleteMembership(mockCtx, mockTx, userId, communityId);

      expect(MembershipRepository.find).toHaveBeenCalledWith(mockCtx, identifier, mockTx);
      expect(MembershipRepository.delete).toHaveBeenCalledWith(mockCtx, identifier, mockTx);
      expect(result).toEqual(existingMembership);
    });

    it("should throw an error if membership does not exist", async () => {
      // [1] Repository.find が null を返すようにモック
      (MembershipRepository.find as jest.Mock).mockResolvedValue(null);

      // [2] エラーを期待
      await expect(
        MembershipService.deleteMembership(mockCtx, mockTx, userId, communityId),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
