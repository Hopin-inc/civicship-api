import { CurrentPrefecture, IdentityPlatform } from "@prisma/client";
import UserRepository from "@/application/domain/account/user/data/repository";
import IdentityService from "@/application/domain/account/user/identity/service";
import IdentityRepository from "@/application/domain/account/user/identity/data/repository";
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

jest.mock("@/application/domain/account/user/data/repository");
jest.mock("@/application/domain/account/user/identity/data/repository");

describe("IdentityService", () => {
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

  const mockFunctions = {
    createWithIdentity: (result: typeof TEST_USER) =>
      (UserRepository.createWithIdentity as jest.Mock).mockResolvedValue(result),

    findIdentity: (result: typeof TEST_IDENTITY | null) =>
      (IdentityRepository.find as jest.Mock).mockResolvedValue(result),

    deleteWithIdentity: (result: typeof TEST_USER) =>
      (UserRepository.deleteWithIdentity as jest.Mock).mockResolvedValue(result),

    deleteFirebaseUser: () => mockTenantedAuth.deleteUser.mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFunctions.createWithIdentity(TEST_USER);
    mockFunctions.findIdentity(TEST_IDENTITY);
    mockFunctions.deleteWithIdentity(TEST_USER);
    mockFunctions.deleteFirebaseUser();
    // tenantManager → authForTenant のモック構成をセット
    (auth.tenantManager().authForTenant as jest.Mock).mockReturnValue(mockTenantedAuth);
  });

  describe("createUserAndIdentity", () => {
    it("should create a user with identity and return the created user data", async () => {
      const uid = "test-uid";
      const platform = IdentityPlatform.FACEBOOK;

      const result = await IdentityService.createUserAndIdentity(TEST_USER_DATA, uid, platform);

      expect(UserRepository.createWithIdentity).toHaveBeenCalledWith({
        ...TEST_USER_DATA,
        identities: { create: { uid, platform } },
      });
      expect(result).toEqual(TEST_USER);
    });

    it("should throw an error when user creation fails", async () => {
      const uid = "test-uid";
      const platform = IdentityPlatform.FACEBOOK;
      const error = new Error("User creation failed");
      (UserRepository.createWithIdentity as jest.Mock).mockRejectedValue(error);

      await expect(
        IdentityService.createUserAndIdentity(TEST_USER_DATA, uid, platform),
      ).rejects.toThrow("User creation failed");
    });
  });

  describe("deleteUserAndIdentity", () => {
    it("should delete user and identity when identity exists and return the deleted user data", async () => {
      const result = await IdentityService.deleteUserAndIdentity(TEST_IDENTITY.uid);

      expect(IdentityRepository.find).toHaveBeenCalledWith(TEST_IDENTITY.uid);
      expect(UserRepository.deleteWithIdentity).toHaveBeenCalledWith(TEST_IDENTITY.userId);
      expect(result).toEqual(TEST_USER);
    });

    it("should return null when identity does not exist", async () => {
      mockFunctions.findIdentity(null);

      const result = await IdentityService.deleteUserAndIdentity("nonexistent-uid");

      expect(IdentityRepository.find).toHaveBeenCalledWith("nonexistent-uid");
      expect(result).toBeNull();
    });

    it("should throw an error when user deletion fails", async () => {
      const error = new Error("User deletion failed");
      (UserRepository.deleteWithIdentity as jest.Mock).mockRejectedValue(error);

      await expect(IdentityService.deleteUserAndIdentity(TEST_IDENTITY.uid)).rejects.toThrow(
        "User deletion failed",
      );
    });
  });

  describe("deleteFirebaseAuthUser", () => {
    it("should delete the Firebase auth user successfully", async () => {
      await IdentityService.deleteFirebaseAuthUser(TEST_IDENTITY.uid, TEST_IDENTITY.tenantId);

      expect(auth.tenantManager().authForTenant).toHaveBeenCalledWith(TEST_IDENTITY.tenantId);
      expect(mockTenantedAuth.deleteUser).toHaveBeenCalledWith(TEST_IDENTITY.uid);
    });

    it("should throw an error when Firebase user deletion fails", async () => {
      const error = new Error("Firebase user deletion failed");
      mockTenantedAuth.deleteUser.mockRejectedValue(error);

      await expect(
        IdentityService.deleteFirebaseAuthUser(TEST_IDENTITY.uid, TEST_IDENTITY.tenantId),
      ).rejects.toThrow("Firebase user deletion failed");
    });
  });
});
