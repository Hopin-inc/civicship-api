import "reflect-metadata";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { GqlMutationUserUpdateMyProfileArgs, GqlQueryUsersArgs, GqlSortDirection } from "@/types/graphql";

enum CurrentPrefecture {
  KAGAWA = "KAGAWA",
}
import { container } from "tsyringe";
import UserService from "@/application/domain/account/user/service";
import { IUserRepository } from "@/application/domain/account/user/data/interface";
import UserConverter from "@/application/domain/account/user/data/converter";
import ImageService from "@/application/domain/content/image/service";

describe("UserService", () => {
  // --- Mockクラスを定義 ---
  class MockUserRepository implements IUserRepository {
    find = jest.fn();
    query = jest.fn();
    create = jest.fn();
    update = jest.fn();
    delete = jest.fn();
  }

  class MockUserConverter extends UserConverter {
    filter = jest.fn();
    sort = jest.fn();
    update = jest.fn();
  }

  class MockImageService extends ImageService {
    uploadPublicImage = jest.fn();
  }

  // --- テスト共通変数 ---
  let service: UserService;
  let mockRepository: MockUserRepository;
  let mockConverter: MockUserConverter;
  let mockImageService: MockImageService;

  const TEST_USER_ID = "test-user";
  const mockCtx = { currentUser: { id: TEST_USER_ID }, uid: TEST_USER_ID } as IContext;
  const mockTx = {} as Prisma.TransactionClient;

  const TEST_USER = {
    id: TEST_USER_ID,
    name: "Test User",
    email: "test@example.com",
    slug: "test-user",
    role: "MEMBER",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockRepository = new MockUserRepository();
    mockConverter = new MockUserConverter();
    mockImageService = new MockImageService();

    container.register("UserRepository", { useValue: mockRepository });
    container.register("UserConverter", { useValue: mockConverter });
    container.register("ImageService", { useValue: mockImageService });

    service = container.resolve(UserService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("fetchUsers", () => {
    it("should fetch users with filter and sort", async () => {
      const args: GqlQueryUsersArgs = {
        cursor: "cursor-123",
        filter: { keywords: ["test"] },
        sort: { createdAt: GqlSortDirection.Asc },
      };
      const take = 10;
      const mockWhere = { name: { contains: "test" } };
      const mockOrderBy = { name: "asc" };
      const mockResult = [TEST_USER];

      mockConverter.filter.mockReturnValue(mockWhere);
      mockConverter.sort.mockReturnValue(mockOrderBy);
      mockRepository.query.mockResolvedValue(mockResult);

      const result = await service.fetchUsers(mockCtx, args, take);

      expect(mockConverter.filter).toHaveBeenCalledWith(args.filter);
      expect(mockConverter.sort).toHaveBeenCalledWith(args.sort);
      expect(mockRepository.query).toHaveBeenCalledWith(mockCtx, mockWhere, mockOrderBy, take, args.cursor);
      expect(result).toEqual(mockResult);
    });

    it("should fetch users with empty filter and sort when not provided", async () => {
      const args = { cursor: "cursor-123" };
      const take = 10;
      const mockWhere = {};
      const mockOrderBy = {};
      const mockResult = [TEST_USER];

      mockConverter.filter.mockReturnValue(mockWhere);
      mockConverter.sort.mockReturnValue(mockOrderBy);
      mockRepository.query.mockResolvedValue(mockResult);

      const result = await service.fetchUsers(mockCtx, args, take);

      expect(mockConverter.filter).toHaveBeenCalledWith({});
      expect(mockConverter.sort).toHaveBeenCalledWith({});
      expect(mockRepository.query).toHaveBeenCalledWith(mockCtx, mockWhere, mockOrderBy, take, args.cursor);
      expect(result).toEqual(mockResult);
    });

    it("should handle repository query errors", async () => {
      const args = { cursor: "cursor-123" };
      const take = 10;
      const error = new Error("Database query failed");

      mockConverter.filter.mockReturnValue({});
      mockConverter.sort.mockReturnValue({});
      mockRepository.query.mockRejectedValue(error);

      await expect(service.fetchUsers(mockCtx, args, take)).rejects.toThrow("Database query failed");
    });
  });

  describe("fetchCommunityMembers", () => {
    it("should fetch community members with filter and sort", async () => {
      const args: GqlQueryUsersArgs = {
        cursor: "cursor-456",
        filter: { keywords: ["MEMBER"] },
        sort: { createdAt: GqlSortDirection.Desc },
      };
      const take = 20;
      const mockWhere = { role: "MEMBER" };
      const mockOrderBy = { createdAt: "desc" };
      const mockResult = [TEST_USER];

      mockConverter.filter.mockReturnValue(mockWhere);
      mockConverter.sort.mockReturnValue(mockOrderBy);
      mockRepository.query.mockResolvedValue(mockResult);

      const result = await service.fetchCommunityMembers(mockCtx, args, take);

      expect(mockConverter.filter).toHaveBeenCalledWith(args.filter);
      expect(mockConverter.sort).toHaveBeenCalledWith(args.sort);
      expect(mockRepository.query).toHaveBeenCalledWith(mockCtx, mockWhere, mockOrderBy, take, args.cursor);
      expect(result).toEqual(mockResult);
    });

    it("should fetch community members with default parameters", async () => {
      const args = {};
      const take = 50;
      const mockWhere = {};
      const mockOrderBy = {};
      const mockResult = [];

      mockConverter.filter.mockReturnValue(mockWhere);
      mockConverter.sort.mockReturnValue(mockOrderBy);
      mockRepository.query.mockResolvedValue(mockResult);

      const result = await service.fetchCommunityMembers(mockCtx, args, take);

      expect(mockConverter.filter).toHaveBeenCalledWith({});
      expect(mockConverter.sort).toHaveBeenCalledWith({});
      expect(result).toEqual(mockResult);
    });

    it("should handle zero take parameter", async () => {
      const args = { cursor: "cursor-789" };
      const take = 0;
      const mockResult = [];

      mockConverter.filter.mockReturnValue({});
      mockConverter.sort.mockReturnValue({});
      mockRepository.query.mockResolvedValue(mockResult);

      const result = await service.fetchCommunityMembers(mockCtx, args, take);

      expect(mockRepository.query).toHaveBeenCalledWith(mockCtx, {}, {}, 0, args.cursor);
      expect(result).toEqual(mockResult);
    });
  });

  describe("findUser", () => {
    it("should find user by id successfully", async () => {
      const userId = "user-123";
      mockRepository.find.mockResolvedValue(TEST_USER);

      const result = await service.findUser(mockCtx, userId);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, userId);
      expect(result).toEqual(TEST_USER);
    });

    it("should return null when user is not found", async () => {
      const userId = "nonexistent-user";
      mockRepository.find.mockResolvedValue(null);

      const result = await service.findUser(mockCtx, userId);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, userId);
      expect(result).toBeNull();
    });

    it("should handle empty user id", async () => {
      const userId = "";
      mockRepository.find.mockResolvedValue(null);

      const result = await service.findUser(mockCtx, userId);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, "");
      expect(result).toBeNull();
    });

    it("should handle repository errors", async () => {
      const userId = "user-123";
      const error = new Error("Database connection failed");
      mockRepository.find.mockRejectedValue(error);

      await expect(service.findUser(mockCtx, userId)).rejects.toThrow("Database connection failed");
    });
  });

  describe("updateProfile", () => {
    it("should update profile successfully", async () => {
      const input: GqlMutationUserUpdateMyProfileArgs = {
        input: {
          name: "Updated User",
          slug: "slug",
          currentPrefecture: CurrentPrefecture.KAGAWA,
        },
        permission: {
          userId: "",
        },
      };
      const updatedData = {
        name: "Updated User",
        slug: "slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      };

      mockConverter.update.mockReturnValue({ data: updatedData, image: undefined });
      mockRepository.update.mockResolvedValue(TEST_USER);

      const result = await service.updateProfile(mockCtx, input, mockTx);

      expect(mockConverter.update).toHaveBeenCalledWith(input.input);
      expect(mockRepository.update).toHaveBeenCalledWith(
        mockCtx,
        mockCtx.currentUser.id,
        expect.objectContaining(updatedData),
        mockTx,
      );
      expect(result).toEqual(TEST_USER);
    });

    it("should upload image if provided", async () => {
      const input: GqlMutationUserUpdateMyProfileArgs = {
        input: {
          name: "User with Image",
          slug: "slug",
          currentPrefecture: CurrentPrefecture.KAGAWA,
        },
        permission: {
          userId: "",
        },
      };
      const updatedData = {
        name: "User with Image",
        slug: "slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      };
      const mockImage = { file: "mock-file" };

      mockConverter.update.mockReturnValue({ data: updatedData, image: mockImage });
      mockImageService.uploadPublicImage.mockResolvedValue({ url: "mock-url" });
      mockRepository.update.mockResolvedValue(TEST_USER);

      const result = await service.updateProfile(mockCtx, input, mockTx);

      expect(mockImageService.uploadPublicImage).toHaveBeenCalledWith(mockImage, "users");
      expect(mockRepository.update).toHaveBeenCalled();
      expect(result).toEqual(TEST_USER);
    });

    it("should throw error when uid is missing", async () => {
      const ctxWithoutUid = { currentUser: { id: TEST_USER_ID } } as IContext;
      const input: GqlMutationUserUpdateMyProfileArgs = {
        input: { name: "Test", slug: "test" },
        permission: { userId: "" },
      };

      await expect(service.updateProfile(ctxWithoutUid, input, mockTx)).rejects.toThrow(
        "Authentication required (uid or platform missing)",
      );
    });

    it("should throw error when currentUser is missing", async () => {
      const ctxWithoutCurrentUser = { uid: TEST_USER_ID } as IContext;
      const input: GqlMutationUserUpdateMyProfileArgs = {
        input: { name: "Test", slug: "test" },
        permission: { userId: "" },
      };

      await expect(service.updateProfile(ctxWithoutCurrentUser, input, mockTx)).rejects.toThrow(
        "Authentication required (uid or platform missing)",
      );
    });

    it("should throw error when both uid and currentUser are missing", async () => {
      const ctxWithoutAuth = {} as IContext;
      const input: GqlMutationUserUpdateMyProfileArgs = {
        input: { name: "Test", slug: "test" },
        permission: { userId: "" },
      };

      await expect(service.updateProfile(ctxWithoutAuth, input, mockTx)).rejects.toThrow(
        "Authentication required (uid or platform missing)",
      );
    });

    it("should handle empty name input", async () => {
      const input: GqlMutationUserUpdateMyProfileArgs = {
        input: { name: "", slug: "empty" },
        permission: { userId: "" },
      };
      const updatedData = { name: "" };

      mockConverter.update.mockReturnValue({ data: updatedData, image: undefined });
      mockRepository.update.mockResolvedValue(TEST_USER);

      const result = await service.updateProfile(mockCtx, input, mockTx);

      expect(mockConverter.update).toHaveBeenCalledWith(input.input);
      expect(result).toEqual(TEST_USER);
    });

    it("should handle empty slug input", async () => {
      const input: GqlMutationUserUpdateMyProfileArgs = {
        input: { name: "Test User", slug: "" },
        permission: { userId: "" },
      };
      const updatedData = { slug: "" };

      mockConverter.update.mockReturnValue({ data: updatedData, image: undefined });
      mockRepository.update.mockResolvedValue(TEST_USER);

      const result = await service.updateProfile(mockCtx, input, mockTx);

      expect(mockConverter.update).toHaveBeenCalledWith(input.input);
      expect(result).toEqual(TEST_USER);
    });

    it("should handle image upload failure", async () => {
      const input: GqlMutationUserUpdateMyProfileArgs = {
        input: { name: "Test User", slug: "test-user" },
        permission: { userId: "" },
      };
      const mockImage = { file: "mock-file" };
      const error = new Error("Image upload failed");

      mockConverter.update.mockReturnValue({ data: { name: "Test User" }, image: mockImage });
      mockImageService.uploadPublicImage.mockRejectedValue(error);

      await expect(service.updateProfile(mockCtx, input, mockTx)).rejects.toThrow("Image upload failed");
    });

    it("should handle repository update failure", async () => {
      const input: GqlMutationUserUpdateMyProfileArgs = {
        input: { name: "Test User", slug: "test-user" },
        permission: { userId: "" },
      };
      const error = new Error("Database update failed");

      mockConverter.update.mockReturnValue({ data: { name: "Test User" }, image: undefined });
      mockRepository.update.mockRejectedValue(error);

      await expect(service.updateProfile(mockCtx, input, mockTx)).rejects.toThrow("Database update failed");
    });
  });
});
