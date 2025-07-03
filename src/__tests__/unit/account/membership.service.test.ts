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
  });

  describe("findMembershipDetail", () => {
    it("should find membership detail successfully", async () => {
      const membershipDetail = { 
        userId, 
        communityId, 
        role: Role.MEMBER, 
        status: MembershipStatus.JOINED,
        user: { name: "Test User" },
        community: { name: "Test Community" }
      };
      mockRepository.findDetail.mockResolvedValue(membershipDetail);

      const result = await service.findMembershipDetail(mockCtx, userId, communityId);

      expect(mockRepository.findDetail).toHaveBeenCalledWith(mockCtx, {
        userId_communityId: { userId, communityId }
      });
      expect(result).toEqual(membershipDetail);
    });

    it("should return null when membership detail is not found", async () => {
      mockRepository.findDetail.mockResolvedValue(null);

      const result = await service.findMembershipDetail(mockCtx, "nonexistent-user", communityId);

      expect(mockRepository.findDetail).toHaveBeenCalledWith(mockCtx, {
        userId_communityId: { userId: "nonexistent-user", communityId }
      });
      expect(result).toBeNull();
    });

    it("should handle empty userId", async () => {
      mockRepository.findDetail.mockResolvedValue(null);

      const result = await service.findMembershipDetail(mockCtx, "", communityId);

      expect(mockRepository.findDetail).toHaveBeenCalledWith(mockCtx, {
        userId_communityId: { userId: "", communityId }
      });
      expect(result).toBeNull();
    });

    it("should handle empty communityId", async () => {
      mockRepository.findDetail.mockResolvedValue(null);

      const result = await service.findMembershipDetail(mockCtx, userId, "");

      expect(mockRepository.findDetail).toHaveBeenCalledWith(mockCtx, {
        userId_communityId: { userId, communityId: "" }
      });
      expect(result).toBeNull();
    });
  });

  describe("findMembership", () => {
    it("should find membership", async () => {
      const membership = { userId, communityId, role: Role.MEMBER };
      mockRepository.find.mockResolvedValue(membership);

      const result = await service.findMembership(mockCtx, userId, communityId);

      expect(result).toEqual(membership);
    });

    it("should return null when membership is not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      const result = await service.findMembership(mockCtx, "nonexistent-user", communityId);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, {
        userId_communityId: { userId: "nonexistent-user", communityId }
      });
      expect(result).toBeNull();
    });
  });

  describe("findMembershipOrThrow", () => {
    it("should return membership when found", async () => {
      const membership = { userId, communityId, role: Role.MEMBER };
      mockRepository.find.mockResolvedValue(membership);

      const result = await service.findMembershipOrThrow(mockCtx, userId, communityId);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, {
        userId_communityId: { userId, communityId }
      });
      expect(result).toEqual(membership);
    });

    it("should throw NotFoundError when membership is not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(
        service.findMembershipOrThrow(mockCtx, "nonexistent-user", communityId)
      ).rejects.toThrow(NotFoundError);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, {
        userId_communityId: { userId: "nonexistent-user", communityId }
      });
    });

    it("should throw NotFoundError with correct parameters", async () => {
      mockRepository.find.mockResolvedValue(null);

      try {
        await service.findMembershipOrThrow(mockCtx, userId, communityId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error.message).toContain("Membership");
      }
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

      expect(mockConverter.invite).toHaveBeenCalledWith(userId, communityId, "admin-user", Role.MEMBER);
      expect(mockRepository.create).toHaveBeenCalledWith(mockCtx, mockInput, mockTx);
      expect(result).toEqual(mockCreated);
    });

    it("should invite a member with MANAGER role", async () => {
      const input = { userId, communityId, role: Role.MANAGER };
      const mockInput = {};
      const mockCreated = { userId, communityId, role: Role.MANAGER };

      mockConverter.invite.mockReturnValue(mockInput);
      mockRepository.create.mockResolvedValue(mockCreated);

      const result = await service.inviteMember(mockCtx, input, mockTx);

      expect(mockConverter.invite).toHaveBeenCalledWith(userId, communityId, "admin-user", Role.MANAGER);
      expect(result).toEqual(mockCreated);
    });

    it("should invite a member with OWNER role", async () => {
      const input = { userId, communityId, role: Role.OWNER };
      const mockInput = {};
      const mockCreated = { userId, communityId, role: Role.OWNER };

      mockConverter.invite.mockReturnValue(mockInput);
      mockRepository.create.mockResolvedValue(mockCreated);

      const result = await service.inviteMember(mockCtx, input, mockTx);

      expect(mockConverter.invite).toHaveBeenCalledWith(userId, communityId, "admin-user", Role.OWNER);
      expect(result).toEqual(mockCreated);
    });

    it("should throw error when repository create fails", async () => {
      const input = { userId, communityId, role: Role.MEMBER };
      const error = new Error("Database constraint violation");

      mockConverter.invite.mockReturnValue({});
      mockRepository.create.mockRejectedValue(error);

      await expect(service.inviteMember(mockCtx, input, mockTx)).rejects.toThrow("Database constraint violation");
    });

    it("should handle empty userId in input", async () => {
      const input = { userId: "", communityId, role: Role.MEMBER };
      const mockInput = {};
      const mockCreated = { userId: "", communityId, role: Role.MEMBER };

      mockConverter.invite.mockReturnValue(mockInput);
      mockRepository.create.mockResolvedValue(mockCreated);

      const result = await service.inviteMember(mockCtx, input, mockTx);

      expect(mockConverter.invite).toHaveBeenCalledWith("", communityId, "admin-user", Role.MEMBER);
      expect(result).toEqual(mockCreated);
    });

    it("should handle empty communityId in input", async () => {
      const input = { userId, communityId: "", role: Role.MEMBER };
      const mockInput = {};
      const mockCreated = { userId, communityId: "", role: Role.MEMBER };

      mockConverter.invite.mockReturnValue(mockInput);
      mockRepository.create.mockResolvedValue(mockCreated);

      const result = await service.inviteMember(mockCtx, input, mockTx);

      expect(mockConverter.invite).toHaveBeenCalledWith(userId, "", "admin-user", Role.MEMBER);
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

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, {
        userId_communityId: { userId, communityId }
      });
      expect(mockConverter.join).toHaveBeenCalledWith("admin-user", communityId, userId);
      expect(mockRepository.create).toHaveBeenCalledWith(mockCtx, mockInput, mockTx);
      expect(result).toEqual(mockCreated);
    });

    it("should create membership for current user when joinedUserId is not provided", async () => {
      mockRepository.find.mockResolvedValue(null);
      const mockInput = {};
      const mockCreated = { userId: "admin-user", communityId, role: Role.MEMBER };
      mockConverter.join.mockReturnValue(mockInput);
      mockRepository.create.mockResolvedValue(mockCreated);

      const result = await service.joinIfNeeded(mockCtx, "admin-user", communityId, mockTx);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, {
        userId_communityId: { userId: "admin-user", communityId }
      });
      expect(mockConverter.join).toHaveBeenCalledWith("admin-user", communityId, undefined);
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

      expect(mockConverter.update).toHaveBeenCalledWith(
        MembershipStatus.JOINED,
        MembershipStatusReason.ACCEPTED_INVITATION,
        existing.role,
        "admin-user"
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        mockCtx,
        { userId_communityId: { userId, communityId } },
        mockInput,
        mockTx
      );
      expect(result).toEqual(updated);
    });

    it("should update membership with INVITED status to JOINED", async () => {
      const existing = { userId, communityId, status: MembershipStatus.INVITED, role: Role.MEMBER };
      mockRepository.find.mockResolvedValue(existing);

      const mockInput = {};
      const updated = { ...existing, status: MembershipStatus.JOINED };
      mockConverter.update.mockReturnValue(mockInput);
      mockRepository.update.mockResolvedValue(updated);

      const result = await service.joinIfNeeded(mockCtx, "admin-user", communityId, mockTx, userId);

      expect(mockConverter.update).toHaveBeenCalledWith(
        MembershipStatus.JOINED,
        MembershipStatusReason.ACCEPTED_INVITATION,
        existing.role,
        "admin-user"
      );
      expect(result).toEqual(updated);
    });

    it("should update membership with LEFT status to JOINED", async () => {
      const existing = { userId, communityId, status: MembershipStatus.LEFT, role: Role.MEMBER };
      mockRepository.find.mockResolvedValue(existing);

      const mockInput = {};
      const updated = { ...existing, status: MembershipStatus.JOINED };
      mockConverter.update.mockReturnValue(mockInput);
      mockRepository.update.mockResolvedValue(updated);

      const result = await service.joinIfNeeded(mockCtx, "admin-user", communityId, mockTx, userId);

      expect(mockConverter.update).toHaveBeenCalledWith(
        MembershipStatus.JOINED,
        MembershipStatusReason.ACCEPTED_INVITATION,
        existing.role,
        "admin-user"
      );
      expect(result).toEqual(updated);
    });

    it("should return existing membership if already joined", async () => {
      const existing = { userId, communityId, status: MembershipStatus.JOINED, role: Role.MEMBER };
      mockRepository.find.mockResolvedValue(existing);

      const result = await service.joinIfNeeded(mockCtx, "admin-user", communityId, mockTx, userId);

      expect(mockConverter.update).not.toHaveBeenCalled();
      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(existing);
    });

    it("should handle repository create failure", async () => {
      mockRepository.find.mockResolvedValue(null);
      const error = new Error("Database create failed");
      mockConverter.join.mockReturnValue({});
      mockRepository.create.mockRejectedValue(error);

      await expect(
        service.joinIfNeeded(mockCtx, "admin-user", communityId, mockTx, userId)
      ).rejects.toThrow("Database create failed");
    });

    it("should handle repository update failure", async () => {
      const existing = { userId, communityId, status: MembershipStatus.PENDING, role: Role.MEMBER };
      mockRepository.find.mockResolvedValue(existing);
      const error = new Error("Database update failed");
      mockConverter.update.mockReturnValue({});
      mockRepository.update.mockRejectedValue(error);

      await expect(
        service.joinIfNeeded(mockCtx, "admin-user", communityId, mockTx, userId)
      ).rejects.toThrow("Database update failed");
    });
  });

  describe("setStatus", () => {
    it("should set membership status to LEFT with WITHDRAWN reason", async () => {
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

      expect(mockConverter.update).toHaveBeenCalledWith(
        MembershipStatus.LEFT,
        MembershipStatusReason.WITHDRAWN,
        existing.role,
        "admin-user"
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        mockCtx,
        { userId_communityId: { userId, communityId } },
        mockInput,
        mockTx
      );
      expect(result).toEqual(updated);
    });

    it("should set membership status to JOINED with ACCEPTED_INVITATION reason", async () => {
      const existing = { userId, communityId, status: MembershipStatus.INVITED, role: Role.MEMBER };
      mockRepository.find.mockResolvedValue(existing);

      const mockInput = {};
      const updated = { ...existing, status: MembershipStatus.JOINED };
      mockConverter.update.mockReturnValue(mockInput);
      mockRepository.update.mockResolvedValue(updated);

      const result = await service.setStatus(
        mockCtx,
        { userId, communityId },
        MembershipStatus.JOINED,
        MembershipStatusReason.ACCEPTED_INVITATION,
        mockTx,
      );

      expect(mockConverter.update).toHaveBeenCalledWith(
        MembershipStatus.JOINED,
        MembershipStatusReason.ACCEPTED_INVITATION,
        existing.role,
        "admin-user"
      );
      expect(result).toEqual(updated);
    });

    it("should set membership status to BANNED with VIOLATION reason", async () => {
      const existing = { userId, communityId, status: MembershipStatus.JOINED, role: Role.MEMBER };
      mockRepository.find.mockResolvedValue(existing);

      const mockInput = {};
      const updated = { ...existing, status: MembershipStatus.BANNED };
      mockConverter.update.mockReturnValue(mockInput);
      mockRepository.update.mockResolvedValue(updated);

      const result = await service.setStatus(
        mockCtx,
        { userId, communityId },
        MembershipStatus.BANNED,
        MembershipStatusReason.VIOLATION,
        mockTx,
      );

      expect(mockConverter.update).toHaveBeenCalledWith(
        MembershipStatus.BANNED,
        MembershipStatusReason.VIOLATION,
        existing.role,
        "admin-user"
      );
      expect(result).toEqual(updated);
    });

    it("should set membership status to PENDING with REQUESTED reason", async () => {
      const existing = { userId, communityId, status: MembershipStatus.LEFT, role: Role.MEMBER };
      mockRepository.find.mockResolvedValue(existing);

      const mockInput = {};
      const updated = { ...existing, status: MembershipStatus.PENDING };
      mockConverter.update.mockReturnValue(mockInput);
      mockRepository.update.mockResolvedValue(updated);

      const result = await service.setStatus(
        mockCtx,
        { userId, communityId },
        MembershipStatus.PENDING,
        MembershipStatusReason.REQUESTED,
        mockTx,
      );

      expect(mockConverter.update).toHaveBeenCalledWith(
        MembershipStatus.PENDING,
        MembershipStatusReason.REQUESTED,
        existing.role,
        "admin-user"
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

    it("should handle repository update failure", async () => {
      const existing = { userId, communityId, status: MembershipStatus.PENDING, role: Role.MEMBER };
      mockRepository.find.mockResolvedValue(existing);
      const error = new Error("Database update failed");
      mockConverter.update.mockReturnValue({});
      mockRepository.update.mockRejectedValue(error);

      await expect(
        service.setStatus(
          mockCtx,
          { userId, communityId },
          MembershipStatus.LEFT,
          MembershipStatusReason.WITHDRAWN,
          mockTx,
        )
      ).rejects.toThrow("Database update failed");
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
