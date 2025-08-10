import "reflect-metadata";
import { container } from "tsyringe";
import UtilityService from "@/application/domain/reward/utility/service";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import { IContext } from "@/types/server";
import { Prisma, PublishStatus } from "@prisma/client";
import {
  GqlUtilityCreateInput,
  GqlMutationUtilityUpdateInfoArgs,
  GqlUtilityUpdateInfoInput,
  GqlCheckCommunityPermissionInput,
} from "@/types/graphql";
import { IUtilityRepository } from "@/application/domain/reward/utility/data/interface";
import UtilityConverter from "@/application/domain/reward/utility/data/converter";
import ImageService from "@/application/domain/content/image/service";
import { MOCK_IMAGE_UPLOAD_RESULT } from "@/__tests__/helper/mock-helper";

// --- Mockクラス ---
class MockUtilityRepository implements IUtilityRepository {
  findAccessible = jest.fn();
  find = jest.fn();
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  query = jest.fn();
}

class MockUtilityConverter extends UtilityConverter {
  findAccessible = jest.fn();
  create = jest.fn();
  updateInfo = jest.fn();
  filter = jest.fn();
  sort = jest.fn();
}

class MockImageService implements ImageService {
  uploadPublicImage = jest.fn().mockResolvedValue(MOCK_IMAGE_UPLOAD_RESULT);
}

// --- テスト用変数 ---
let service: UtilityService;
let mockRepository: MockUtilityRepository;
let mockConverter: MockUtilityConverter;
let mockImageService: MockImageService;

const mockCtx = {} as IContext;
const mockTx = {} as Prisma.TransactionClient;

beforeEach(() => {
  jest.clearAllMocks();
  container.reset();

  mockRepository = new MockUtilityRepository();
  mockConverter = new MockUtilityConverter();
  mockImageService = new MockImageService();

  container.register("UtilityRepository", { useValue: mockRepository });
  container.register("UtilityConverter", { useValue: mockConverter });
  container.register("ImageService", { useValue: mockImageService });

  service = container.resolve(UtilityService);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("UtilityService", () => {
  describe("findUtility", () => {
    it("should return utility if found", async () => {
      const filter = { communityIds: ["c1"] };
      const where = { id: "u1", AND: [{ communityId: "c1" }] };
      const mockUtility = {
        id: "u1",
        name: "Test Utility",
        publishStatus: PublishStatus.PUBLIC,
        description: "Test Description",
        pointsRequired: 100,
        communityId: "c1",
        createdAt: new Date(),
        updatedAt: null,
        community: {
          id: "c1",
          name: "Test Community",
          createdAt: new Date(),
          updatedAt: null,
          pointName: "Points",
          bio: null,
          establishedAt: null,
          website: null,
          imageId: null,
        },
      };

      mockConverter.findAccessible.mockReturnValue(where);
      mockRepository.findAccessible.mockResolvedValue(mockUtility);

      const result = await service.findUtility(mockCtx, "u1", filter);
      expect(result).toBe(mockUtility);
    });

    it("should return null if not found", async () => {
      mockConverter.findAccessible.mockReturnValue({});
      mockRepository.findAccessible.mockResolvedValue(null);

      const result = await service.findUtility(mockCtx, "unknown", {});
      expect(result).toBeNull();
    });
  });

  describe("findUtilityOrThrow", () => {
    it("should return utility if exists", async () => {
      const mockUtility = {
        id: "u1",
        name: "Test Utility",
        publishStatus: PublishStatus.PUBLIC,
        description: "Test Description",
        pointsRequired: 100,
        communityId: "c1",
        ownerId: null,
        createdAt: new Date(),
        updatedAt: null,
        community: {
          id: "c1",
          name: "Test Community",
          createdAt: new Date(),
          updatedAt: null,
          pointName: "Points",
          bio: null,
          establishedAt: null,
          website: null,
          imageId: null,
        },
      };

      mockRepository.find.mockResolvedValue(mockUtility);

      const result = await service.findUtilityOrThrow(mockCtx, "u1");
      expect(result).toBe(mockUtility);
    });

    it("should throw NotFoundError if not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(service.findUtilityOrThrow(mockCtx, "nope")).rejects.toThrow(NotFoundError);
    });
  });

  describe("createUtility", () => {
    it("should convert input and call repository.create", async () => {
      const input: GqlUtilityCreateInput = {
        name: "Test Utility",
        pointsRequired: 100,
        images: [],
      };
      const currentUserId = "u1";
      const communityId = "c1";

      const converted = {
        data: { dummy: true },
        images: [],
      };

      const created = { id: "u1" };

      mockConverter.create.mockReturnValue(converted);
      mockRepository.create.mockResolvedValue(created);

      const result = await service.createUtility(
        mockCtx,
        input,
        currentUserId,
        communityId,
        mockTx,
      );

      expect(result).toBe(created);
      expect(mockConverter.create).toHaveBeenCalledWith(input, currentUserId, communityId);
      expect(mockRepository.create).toHaveBeenCalledWith(
        mockCtx,
        expect.objectContaining({ dummy: true }),
        mockTx,
      );
    });
  });

  describe("deleteUtility", () => {
    it("should call findOrThrow and then delete", async () => {
      const id = "u1";
      const mockUtility = {
        id,
        name: "Test Utility",
        publishStatus: PublishStatus.PUBLIC,
        description: "Test Description",
        pointsRequired: 100,
        communityId: "c1",
        ownerId: null,
        createdAt: new Date(),
        updatedAt: null,
        community: {
          id: "c1",
          name: "Test Community",
          createdAt: new Date(),
          updatedAt: null,
          pointName: "Points",
          bio: null,
          establishedAt: null,
          website: null,
          imageId: null,
        },
      };

      jest.spyOn(service, "findUtilityOrThrow").mockResolvedValue(mockUtility);

      mockRepository.delete.mockResolvedValue({ id });

      const result = await service.deleteUtility(mockCtx, id, mockTx);

      expect(service.findUtilityOrThrow).toHaveBeenCalledWith(mockCtx, id);
      expect(mockRepository.delete).toHaveBeenCalledWith(mockCtx, id, mockTx);
      expect(result).toEqual({ id });
    });
  });

  describe("updateUtilityInfo", () => {
    it("should find utility, convert input and update", async () => {
      const input: GqlUtilityUpdateInfoInput = {
        name: "Updated",
        pointsRequired: 100,
        images: [],
      };

      const permission: GqlCheckCommunityPermissionInput = {
        communityId: "c1",
      };

      const args: GqlMutationUtilityUpdateInfoArgs = {
        id: "u1",
        input,
        permission,
      };

      const converted = { name: "Updated", image: "new-img" };
      const updated = { id: "u1", ...converted };

      mockRepository.find.mockResolvedValue({ id: "u1" });
      mockConverter.updateInfo.mockReturnValue({
        data: { name: "Updated", image: "new-img" },
        images: [],
      });
      mockRepository.update.mockResolvedValue(updated);

      const result = await service.updateUtilityInfo(mockCtx, args, mockTx);
      expect(result).toBe(updated);
    });
  });

  describe("validatePublishStatus", () => {
    it("should pass if all statuses are allowed", () => {
      expect(() =>
        service.validatePublishStatus([PublishStatus.PUBLIC], {
          publishStatus: [PublishStatus.PUBLIC],
        }),
      ).not.toThrow();
    });

    it("should throw if disallowed status is present", async () => {
      try {
        service.validatePublishStatus([PublishStatus.PUBLIC], {
          publishStatus: [PublishStatus.PRIVATE],
        });
        fail("Expected ValidationError to be thrown");
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(ValidationError);
        if (e instanceof ValidationError) {
          expect(e.message).toContain("must be one of PUBLIC");
          expect(e.invalidArgs).toContain('["PRIVATE"]');
        }
      }
    });

    it("should handle null and undefined filter edge cases", () => {
      const allowedStatuses = [PublishStatus.PUBLIC];
      
      expect(() => {
        service.validatePublishStatus(allowedStatuses, null as any);
      }).not.toThrow();
      
      expect(() => {
        service.validatePublishStatus(allowedStatuses, undefined as any);
      }).not.toThrow();
      
      expect(() => {
        service.validatePublishStatus(allowedStatuses, { publishStatus: null } as any);
      }).not.toThrow();
    });

    it("should handle empty allowed statuses array", () => {
      const filter = { publishStatus: [PublishStatus.PUBLIC] } as any;
      
      expect(() => {
        service.validatePublishStatus([], filter);
      }).toThrow("Validation error: publishStatus must be one of");
    });

    it("should handle empty publishStatus array", () => {
      const allowedStatuses = [PublishStatus.PUBLIC];
      const filter = { publishStatus: [] } as any;

      expect(() => {
        service.validatePublishStatus(allowedStatuses, filter);
      }).not.toThrow();
    });

    it("should handle very large arrays", () => {
      const allowedStatuses = [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL, PublishStatus.PRIVATE];
      const largeArray = new Array(1000).fill(PublishStatus.PUBLIC);
      const filter = { publishStatus: largeArray } as any;

      expect(() => {
        service.validatePublishStatus(allowedStatuses, filter);
      }).not.toThrow();
    });

    it("should validate error message format", () => {
      const allowedStatuses = [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL];
      const filter = { publishStatus: [PublishStatus.PRIVATE] } as any;

      try {
        service.validatePublishStatus(allowedStatuses, filter);
        fail("Expected ValidationError to be thrown");
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(ValidationError);
        if (e instanceof ValidationError) {
          expect(e.message).toBe("Validation error: publishStatus must be one of PUBLIC, COMMUNITY_INTERNAL");
          expect(e.invalidArgs).toContain('["PRIVATE"]');
        }
      }
    });

    it("should handle mixed valid and invalid statuses", () => {
      const allowedStatuses = [PublishStatus.PUBLIC];
      const filter = { publishStatus: [PublishStatus.PUBLIC, PublishStatus.PRIVATE, "INVALID"] } as any;

      try {
        service.validatePublishStatus(allowedStatuses, filter);
        fail("Expected ValidationError to be thrown");
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(ValidationError);
        if (e instanceof ValidationError) {
          expect(e.message).toContain("must be one of PUBLIC");
        }
      }
    });
  });
});
