import "reflect-metadata";
import { CurrentPrefecture, IdentityPlatform } from "@prisma/client";
import IdentityService from "@/application/domain/account/identity/service";
import { auth } from "@/infrastructure/libs/firebase";

jest.mock("@/infrastructure/libs/firebase", () => {
  const mockDeleteUser = jest.fn();
  const mockAuthForTenant = jest.fn(() => ({
    deleteUser: mockDeleteUser,
  }));
  const mockTenantManager = jest.fn(() => ({
    authForTenant: mockAuthForTenant,
  }));

  return {
    auth: {
      tenantManager: mockTenantManager,
    },
    __esModule: true,
  };
});

describe("IdentityService", () => {
  // --- Mockクラス ---
  class MockUserRepository {
    query = jest.fn();
    find = jest.fn();
    update = jest.fn();
    create = jest.fn();
    delete = jest.fn();
  }

  class MockIdentityRepository {
    find = jest.fn();
    update = jest.fn();
  }

  // --- モックインスタンス ---
  let mockUserRepository: MockUserRepository;
  let mockIdentityRepository: MockIdentityRepository;
  let service: IdentityService;

  const TEST_USER_ID = "user-1";
  const TEST_USER_DATA = {
    name: "Test User",
    email: "test@example.com",
    slug: "test-user",
    currentPrefecture: CurrentPrefecture.KAGAWA,
  };
  const TEST_USER = {
    id: TEST_USER_ID,
    ...TEST_USER_DATA,
    role: "MEMBER",
  };
  const TEST_IDENTITY = {
    userId: TEST_USER_ID,
    uid: "test-uid",
    tenantId: "test-tenant-id",
    platform: IdentityPlatform.LINE,
  };

  const mockTenantedAuth = {
    deleteUser: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepository = new MockUserRepository();
    mockIdentityRepository = new MockIdentityRepository();
    service = new IdentityService(mockUserRepository, mockIdentityRepository);
    (auth.tenantManager as jest.Mock).mockReturnValue({
      authForTenant: jest.fn().mockReturnValue(mockTenantedAuth),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createUserAndIdentity", () => {
    it("should create a user with identity and return the created user data", async () => {
      mockUserRepository.create.mockResolvedValue(TEST_USER);

      const uid = "test-uid";
      const platform = IdentityPlatform.FACEBOOK;

      const result = await service.createUserAndIdentity(TEST_USER_DATA, uid, platform);

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...TEST_USER_DATA,
        identities: {
          create: { uid, platform },
        },
      });
      expect(result).toEqual(TEST_USER);
    });

    it("should throw an error when user creation fails", async () => {
      const uid = "test-uid";
      const platform = IdentityPlatform.FACEBOOK;
      const error = new Error("User creation failed");
      mockUserRepository.create.mockRejectedValue(error);

      await expect(service.createUserAndIdentity(TEST_USER_DATA, uid, platform)).rejects.toThrow(
        "User creation failed",
      );
    });
  });

  describe("deleteUserAndIdentity", () => {
    it("should delete user and identity when identity exists", async () => {
      mockIdentityRepository.find.mockResolvedValue(TEST_IDENTITY);
      mockUserRepository.delete.mockResolvedValue(TEST_USER);

      const result = await service.deleteUserAndIdentity(TEST_IDENTITY.uid);

      expect(mockIdentityRepository.find).toHaveBeenCalledWith(TEST_IDENTITY.uid);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(TEST_IDENTITY.userId);
      expect(result).toEqual(TEST_USER);
    });

    it("should return null when identity does not exist", async () => {
      mockIdentityRepository.find.mockResolvedValue(null);

      const result = await service.deleteUserAndIdentity("nonexistent-uid");

      expect(mockIdentityRepository.find).toHaveBeenCalledWith("nonexistent-uid");
      expect(result).toBeNull();
    });

    it("should throw an error when user deletion fails", async () => {
      mockIdentityRepository.find.mockResolvedValue(TEST_IDENTITY);
      const error = new Error("User deletion failed");
      mockUserRepository.delete.mockRejectedValue(error);

      await expect(service.deleteUserAndIdentity(TEST_IDENTITY.uid)).rejects.toThrow(
        "User deletion failed",
      );
    });
  });

  describe("deleteFirebaseAuthUser", () => {
    it("should delete the Firebase auth user successfully", async () => {
      mockTenantedAuth.deleteUser.mockResolvedValue(undefined);

      await service.deleteFirebaseAuthUser(TEST_IDENTITY.uid, TEST_IDENTITY.tenantId);

      expect(auth.tenantManager().authForTenant).toHaveBeenCalledWith(TEST_IDENTITY.tenantId);
      expect(mockTenantedAuth.deleteUser).toHaveBeenCalledWith(TEST_IDENTITY.uid);
    });

    it("should throw an error when Firebase user deletion fails", async () => {
      const error = new Error("Firebase user deletion failed");
      mockTenantedAuth.deleteUser.mockRejectedValue(error);

      await expect(
        service.deleteFirebaseAuthUser(TEST_IDENTITY.uid, TEST_IDENTITY.tenantId),
      ).rejects.toThrow("Firebase user deletion failed");
    });
  });
});
