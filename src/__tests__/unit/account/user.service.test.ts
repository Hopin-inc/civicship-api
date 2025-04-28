import "reflect-metadata";
import { CurrentPrefecture, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { GqlMutationUserUpdateMyProfileArgs } from "@/types/graphql";
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

    container.register("IUserRepository", { useValue: mockRepository });
    container.register("UserConverter", { useValue: mockConverter });
    container.register("ImageService", { useValue: mockImageService });

    service = container.resolve(UserService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
        mockCtx.uid,
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

      expect(mockImageService.uploadPublicImage).toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalled();
      expect(result).toEqual(TEST_USER);
    });
  });
});
