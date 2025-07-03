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
    create = jest.fn();
    update = jest.fn();
  }

  // --- モックインスタンス ---
  let mockUserRepository: MockUserRepository;
  let mockIdentityRepository: MockIdentityRepository;
  let service: IdentityService;

  const TEST_USER_ID = "user-1";
  const TEST_COMMUNITY_ID = "community-1";
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
    communityId: TEST_COMMUNITY_ID,
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

      const result = await service.createUserAndIdentity(TEST_USER_DATA, uid, platform, TEST_COMMUNITY_ID);

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...TEST_USER_DATA,
        identities: {
          create: { uid, platform, communityId: TEST_COMMUNITY_ID },
        },
      });
      expect(result).toEqual(TEST_USER);
    });

    it("should create a user with both main and phone identities when phoneUid is provided", async () => {
      mockUserRepository.create.mockResolvedValue(TEST_USER);

      const uid = "test-uid";
      const phoneUid = "phone-uid";
      const platform = IdentityPlatform.FACEBOOK;

      const result = await service.createUserAndIdentity(TEST_USER_DATA, uid, platform, TEST_COMMUNITY_ID, phoneUid);

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...TEST_USER_DATA,
        identities: {
          create: [
            { uid, platform, communityId: TEST_COMMUNITY_ID },
            { uid: phoneUid, platform: IdentityPlatform.PHONE },
          ],
        },
      });
      expect(result).toEqual(TEST_USER);
    });

    it("should throw an error when user creation fails", async () => {
      const uid = "test-uid";
      const platform = IdentityPlatform.FACEBOOK;
      const error = new Error("User creation failed");
      mockUserRepository.create.mockRejectedValue(error);

      await expect(service.createUserAndIdentity(TEST_USER_DATA, uid, platform, TEST_COMMUNITY_ID)).rejects.toThrow(
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

  describe("addIdentityToUser", () => {
    const mockCtx = {
      idToken: "test-id-token",
      refreshToken: "test-refresh-token",
      phoneTokenExpiresAt: "1640995200000",
    } as any;

    it("should add identity to user with provided expiry time", async () => {
      mockIdentityRepository.create.mockResolvedValue(undefined);

      await service.addIdentityToUser(mockCtx, TEST_USER_ID, "new-uid", IdentityPlatform.LINE, TEST_COMMUNITY_ID);

      expect(mockIdentityRepository.create).toHaveBeenCalledWith(mockCtx, {
        uid: "new-uid",
        platform: IdentityPlatform.LINE,
        authToken: "test-id-token",
        refreshToken: "test-refresh-token",
        tokenExpiresAt: new Date(1640995200000),
        user: {
          connect: { id: TEST_USER_ID },
        },
        community: {
          connect: { id: TEST_COMMUNITY_ID },
        },
      });
    });

    it("should add identity to user with default expiry time when phoneTokenExpiresAt is not provided", async () => {
      const ctxWithoutExpiry = {
        idToken: "test-id-token",
        refreshToken: "test-refresh-token",
      } as any;
      mockIdentityRepository.create.mockResolvedValue(undefined);

      const beforeCall = Date.now();
      await service.addIdentityToUser(ctxWithoutExpiry, TEST_USER_ID, "new-uid", IdentityPlatform.LINE, TEST_COMMUNITY_ID);
      const afterCall = Date.now();

      const callArgs = mockIdentityRepository.create.mock.calls[0][1];
      const expiryTime = callArgs.tokenExpiresAt.getTime();
      
      expect(expiryTime).toBeGreaterThanOrEqual(beforeCall + 60 * 60 * 1000);
      expect(expiryTime).toBeLessThanOrEqual(afterCall + 60 * 60 * 1000);
    });

    it("should throw an error when identity creation fails", async () => {
      const error = new Error("Identity creation failed");
      mockIdentityRepository.create.mockRejectedValue(error);

      await expect(
        service.addIdentityToUser(mockCtx, TEST_USER_ID, "new-uid", IdentityPlatform.LINE, TEST_COMMUNITY_ID),
      ).rejects.toThrow("Identity creation failed");
    });
  });

  describe("linkPhoneIdentity", () => {
    const mockCtx = {} as any;
    const mockTx = {
      user: {
        findUnique: jest.fn(),
      },
      identity: {
        create: jest.fn(),
      },
    };

    beforeEach(() => {
      mockTx.user.findUnique.mockClear();
      mockTx.identity.create.mockClear();
    });

    it("should link phone identity to existing user", async () => {
      mockTx.user.findUnique.mockResolvedValue({ id: TEST_USER_ID });
      mockTx.identity.create.mockResolvedValue(undefined);
      mockUserRepository.find.mockResolvedValue(TEST_USER);

      const result = await service.linkPhoneIdentity(mockCtx, TEST_USER_ID, "phone-uid", mockTx);

      expect(mockTx.user.findUnique).toHaveBeenCalledWith({
        where: { id: TEST_USER_ID },
        select: { id: true },
      });
      expect(mockTx.identity.create).toHaveBeenCalledWith({
        data: {
          uid: "phone-uid",
          platform: IdentityPlatform.PHONE,
          userId: TEST_USER_ID,
        },
      });
      expect(mockUserRepository.find).toHaveBeenCalledWith(mockCtx, TEST_USER_ID);
      expect(result).toEqual(TEST_USER);
    });

    it("should throw an error when user is not found", async () => {
      mockTx.user.findUnique.mockResolvedValue(null);

      await expect(
        service.linkPhoneIdentity(mockCtx, "nonexistent-user", "phone-uid", mockTx),
      ).rejects.toThrow("User with ID nonexistent-user not found");

      expect(mockTx.identity.create).not.toHaveBeenCalled();
    });

    it("should throw an error when identity creation fails", async () => {
      mockTx.user.findUnique.mockResolvedValue({ id: TEST_USER_ID });
      const error = new Error("Identity creation failed");
      mockTx.identity.create.mockRejectedValue(error);

      await expect(
        service.linkPhoneIdentity(mockCtx, TEST_USER_ID, "phone-uid", mockTx),
      ).rejects.toThrow("Identity creation failed");
    });
  });

  describe("findUserByIdentity", () => {
    const mockCtx = {} as any;

    it("should return user when identity exists", async () => {
      mockIdentityRepository.find.mockResolvedValue(TEST_IDENTITY);
      mockUserRepository.find.mockResolvedValue(TEST_USER);

      const result = await service.findUserByIdentity(mockCtx, TEST_IDENTITY.uid);

      expect(mockIdentityRepository.find).toHaveBeenCalledWith(TEST_IDENTITY.uid);
      expect(mockUserRepository.find).toHaveBeenCalledWith(mockCtx, TEST_IDENTITY.userId);
      expect(result).toEqual(TEST_USER);
    });

    it("should return null when identity does not exist", async () => {
      mockIdentityRepository.find.mockResolvedValue(null);

      const result = await service.findUserByIdentity(mockCtx, "nonexistent-uid");

      expect(mockIdentityRepository.find).toHaveBeenCalledWith("nonexistent-uid");
      expect(mockUserRepository.find).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("should throw an error when user repository fails", async () => {
      mockIdentityRepository.find.mockResolvedValue(TEST_IDENTITY);
      const error = new Error("User repository failed");
      mockUserRepository.find.mockRejectedValue(error);

      await expect(
        service.findUserByIdentity(mockCtx, TEST_IDENTITY.uid),
      ).rejects.toThrow("User repository failed");
    });
  });

  describe("fetchNewIdToken", () => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch;

    beforeEach(() => {
      mockFetch.mockClear();
      process.env.FIREBASE_TOKEN_API_KEY = "test-api-key";
    });

    it("should fetch new ID token successfully", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          id_token: "new-id-token",
          refresh_token: "new-refresh-token",
          expires_in: "3600",
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await service.fetchNewIdToken("test-refresh-token");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://securetoken.googleapis.com/v1/token?key=test-api-key",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            grant_type: "refresh_token",
            refresh_token: "test-refresh-token",
          }),
        },
      );
      expect(result).toEqual({
        idToken: "new-id-token",
        refreshToken: "new-refresh-token",
        expiresIn: "3600",
      });
    });

    it("should throw an error when refresh token is invalid", async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: jest.fn().mockResolvedValue("Invalid refresh token"),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(service.fetchNewIdToken("invalid-refresh-token")).rejects.toThrow(
        "Firebase token refresh failed: 400 Bad Request",
      );
    });

    it("should throw an error when network request fails", async () => {
      const networkError = new Error("Network error");
      mockFetch.mockRejectedValue(networkError);

      await expect(service.fetchNewIdToken("test-refresh-token")).rejects.toThrow("Network error");
    });

    it("should throw an error when response is not ok", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: jest.fn().mockResolvedValue("Server error"),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(service.fetchNewIdToken("test-refresh-token")).rejects.toThrow(
        "Firebase token refresh failed: 500 Internal Server Error",
      );
    });
  });

  describe("storeAuthTokens", () => {
    it("should store auth tokens successfully", async () => {
      mockIdentityRepository.update.mockResolvedValue(undefined);

      const uid = "test-uid";
      const authToken = "new-auth-token";
      const refreshToken = "new-refresh-token";
      const expiryTime = new Date("2024-12-31T23:59:59Z");

      await service.storeAuthTokens(uid, authToken, refreshToken, expiryTime);

      expect(mockIdentityRepository.update).toHaveBeenCalledWith(uid, {
        authToken,
        refreshToken,
        tokenExpiresAt: expiryTime,
      });
    });

    it("should throw an error when identity update fails", async () => {
      const error = new Error("Identity update failed");
      mockIdentityRepository.update.mockRejectedValue(error);

      const uid = "test-uid";
      const authToken = "new-auth-token";
      const refreshToken = "new-refresh-token";
      const expiryTime = new Date("2024-12-31T23:59:59Z");

      await expect(
        service.storeAuthTokens(uid, authToken, refreshToken, expiryTime),
      ).rejects.toThrow("Identity update failed");
    });

    it("should handle null/undefined values gracefully", async () => {
      mockIdentityRepository.update.mockResolvedValue(undefined);

      await service.storeAuthTokens("test-uid", "", "", new Date());

      expect(mockIdentityRepository.update).toHaveBeenCalledWith("test-uid", {
        authToken: "",
        refreshToken: "",
        tokenExpiresAt: expect.any(Date),
      });
    });
  });
});
