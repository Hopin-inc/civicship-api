import "reflect-metadata";
import { MembershipStatus, MembershipStatusReason, Prisma, Role } from "@prisma/client";
import { container } from "tsyringe";
import MembershipService from "@/application/domain/account/membership/service";
import { IContext } from "@/types/server";
import { NotFoundError } from "@/errors/graphql";
import { IMembershipRepository } from "@/application/domain/account/membership/data/interface";
import MembershipConverter from "@/application/domain/account/membership/data/converter";

// --- Mockクラス ---
class MockMembershipRepository implements IMembershipRepository {
  query = jest.fn();
  findDetail = jest.fn();
  find = jest.fn();
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
}

class MockMembershipConverter extends MembershipConverter {
  filter = jest.fn();
  sort = jest.fn();
  invite = jest.fn();
  join = jest.fn();
  update = jest.fn();
}

class MockUtils {
  getCurrentUserId = jest.fn();
}

// --- テスト用変数 ---
let service: MembershipService;
let mockRepository: MockMembershipRepository;
let mockConverter: MockMembershipConverter;
let mockUtils: MockUtils;

const mockCtx = {} as IContext;
const mockTx = {} as Prisma.TransactionClient;

const userId = "user-123";
const communityId = "community-123";

beforeEach(() => {
  jest.clearAllMocks();
  container.reset();

  mockRepository = new MockMembershipRepository();
  mockConverter = new MockMembershipConverter();
  mockUtils = new MockUtils();
  mockUtils.getCurrentUserId = jest.fn().mockReturnValue("admin-user");

  container.register("MembershipRepository", { useValue: mockRepository });
  container.register("MembershipConverter", { useValue: mockConverter });
  container.register("getCurrentUserId", { useValue: mockUtils.getCurrentUserId });

  service = container.resolve(MembershipService);
});

afterEach(() => {
  jest.restoreAllMocks();
});

// --- 各 describe ---

describe("MembershipService", () => {
  describe("fetchMemberships", () => {
    it("should fetch memberships", async () => {
      const memberships = [{ userId, communityId, role: Role.MEMBER }];
      mockConverter.filter.mockReturnValue({});
      mockConverter.sort.mockReturnValue({ createdAt: "desc" });
      mockRepository.query.mockResolvedValue(memberships);

      const result = await service.fetchMemberships(
        mockCtx,
        { filter: {}, sort: {}, cursor: undefined },
        10,
      );

      expect(mockRepository.query).toHaveBeenCalled();
      expect(result).toEqual(memberships);
    });

    it("should filter memberships by multiple roles", async () => {
      const memberships = [
        { userId: "user1", communityId, role: Role.OWNER },
        { userId: "user2", communityId, role: Role.MANAGER },
      ];
      mockConverter.filter.mockReturnValue({
        AND: [{ role: { in: [Role.OWNER, Role.MANAGER] } }],
      });
      mockConverter.sort.mockReturnValue({ createdAt: "desc" });
      mockRepository.query.mockResolvedValue(memberships);

      const result = await service.fetchMemberships(
        mockCtx,
        { filter: { role: [Role.OWNER, Role.MANAGER] }, sort: {}, cursor: undefined },
        10,
      );

      expect(mockConverter.filter).toHaveBeenCalledWith({
        role: [Role.OWNER, Role.MANAGER],
      });
      expect(result).toEqual(memberships);
    });

    it("should handle empty role array", async () => {
      const memberships = [{ userId, communityId, role: Role.MEMBER }];
      mockConverter.filter.mockReturnValue({});
      mockConverter.sort.mockReturnValue({ createdAt: "desc" });
      mockRepository.query.mockResolvedValue(memberships);

      const result = await service.fetchMemberships(
        mockCtx,
        { filter: { role: [] }, sort: {}, cursor: undefined },
        10,
      );

      expect(mockConverter.filter).toHaveBeenCalledWith({
        role: [],
      });
      expect(result).toEqual(memberships);
    });
  });

  describe("findMembership", () => {
    it("should find membership", async () => {
      const membership = { userId, communityId, role: Role.MEMBER };
      mockRepository.find.mockResolvedValue(membership);

      const result = await service.findMembership(mockCtx, userId, communityId);

      expect(result).toEqual(membership);
    });
  });

  describe("inviteMember", () => {
    it("should invite a member", async () => {
      const input = { userId, communityId, role: Role.MEMBER };
      const mockInput = {};
      const mockCreated = { userId, communityId, role: Role.MEMBER };

      mockConverter.invite.mockReturnValue(mockInput);
      mockRepository.create.mockResolvedValue(mockCreated);

      const result = await service.inviteMember(mockCtx, input, mockTx);

      expect(result).toEqual(mockCreated);
    });
  });

  describe("joinIfNeeded", () => {
    it("should create membership if not found", async () => {
      mockRepository.find.mockResolvedValue(null);
      const mockInput = {};
      const mockCreated = { userId, communityId, role: Role.MEMBER };
      mockConverter.join.mockReturnValue(mockInput);
      mockRepository.create.mockResolvedValue(mockCreated);

      const result = await service.joinIfNeeded(mockCtx, "admin-user", communityId, mockTx, userId);

      expect(result).toEqual(mockCreated);
    });

    it("should update membership if exists but not joined", async () => {
      const existing = { userId, communityId, status: MembershipStatus.PENDING, role: Role.MEMBER };
      mockRepository.find.mockResolvedValue(existing);

      const mockInput = {};
      const updated = { ...existing, status: MembershipStatus.JOINED };
      mockConverter.update.mockReturnValue(mockInput);
      mockRepository.update.mockResolvedValue(updated);

      const result = await service.joinIfNeeded(mockCtx, "admin-user", communityId, mockTx, userId);

      expect(result).toEqual(updated);
    });
  });

  describe("setStatus", () => {
    it("should set membership status", async () => {
      const existing = { userId, communityId, status: MembershipStatus.PENDING, role: Role.MEMBER };
      mockRepository.find.mockResolvedValue(existing);

      const mockInput = {};
      const updated = { ...existing, status: MembershipStatus.LEFT };
      mockConverter.update.mockReturnValue(mockInput);
      mockRepository.update.mockResolvedValue(updated);

      const result = await service.setStatus(
        mockCtx,
        { userId, communityId },
        MembershipStatus.LEFT,
        MembershipStatusReason.WITHDRAWN,
        mockTx,
      );

      expect(result).toEqual(updated);
    });

    it("should throw if membership not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(
        service.setStatus(
          mockCtx,
          { userId, communityId },
          MembershipStatus.LEFT,
          MembershipStatusReason.WITHDRAWN,
          mockTx,
        ),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("setRole", () => {
    it("should update membership role", async () => {
      const existing = { userId, communityId, status: MembershipStatus.JOINED, role: Role.MEMBER };
      mockRepository.find.mockResolvedValue(existing);

      const mockInput = {};
      const updated = { ...existing, role: Role.MANAGER };
      mockConverter.update.mockReturnValue(mockInput);
      mockRepository.update.mockResolvedValue(updated);

      const result = await service.setRole(mockCtx, { userId, communityId }, Role.MANAGER, mockTx);

      expect(result).toEqual(updated);
    });

    it("should throw if membership not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(
        service.setRole(mockCtx, { userId, communityId }, Role.MANAGER, mockTx),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteMembership", () => {
    it("should delete membership", async () => {
      const existing = { userId, communityId, role: Role.MEMBER };
      mockRepository.find.mockResolvedValue(existing);
      mockRepository.delete.mockResolvedValue(existing);

      const result = await service.deleteMembership(mockCtx, mockTx, userId, communityId);

      expect(result).toEqual(existing);
    });

    it("should throw if membership not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(service.deleteMembership(mockCtx, mockTx, userId, communityId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
