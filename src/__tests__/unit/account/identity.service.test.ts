import "reflect-metadata";
import IdentityService from "@/application/domain/account/identity/service";
import { auth } from "@/infrastructure/libs/firebase";
import { CurrentPrefecture, IdentityPlatform } from "@prisma/client";

jest.mock("@/infrastructure/libs/firebase", () => {
  return {
    auth: {
      deleteUser: jest.fn(),
    },
    __esModule: true,
  };
});

describe("IdentityService", () => {
  class MockUserRepository {
    query = jest.fn();
    find = jest.fn();
    update = jest.fn();
    create = jest.fn();
    delete = jest.fn();
  }

  class MockIdentityRepository {
    find = jest.fn();
    findByUid = jest.fn();
    create = jest.fn();
    update = jest.fn();
  }

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
    communityId: TEST_COMMUNITY_ID,
    platform: IdentityPlatform.LINE,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepository = new MockUserRepository();
    mockIdentityRepository = new MockIdentityRepository();
    service = new IdentityService(mockUserRepository, mockIdentityRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createUserAndIdentity", () => {
    it("should create a user with identity and return the created user data", async () => {
      mockUserRepository.create.mockResolvedValue(TEST_USER);

      const uid = "test-uid";
      const platform = IdentityPlatform.FACEBOOK;

      const userData = {
        ...TEST_USER_DATA,
        identities: {
          create: { uid, platform, communityId: TEST_COMMUNITY_ID },
        },
      };

      const result = await service.createUserAndIdentity(userData);

      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(TEST_USER);
    });

    it("should throw an error when user creation fails", async () => {
      const uid = "test-uid";
      const platform = IdentityPlatform.FACEBOOK;
      const error = new Error("User creation failed");
      mockUserRepository.create.mockRejectedValue(error);

      const userData = {
        ...TEST_USER_DATA,
        identities: {
          create: { uid, platform, communityId: TEST_COMMUNITY_ID },
        },
      };

      await expect(
        service.createUserAndIdentity(userData),
      ).rejects.toThrow("User creation failed");
    });
  });

  describe("deleteUserAndIdentity", () => {
    it("should delete user and identity when identity exists", async () => {
      mockIdentityRepository.find.mockResolvedValue(TEST_IDENTITY);
      mockUserRepository.delete.mockResolvedValue(TEST_USER);

      const result = await service.deleteUserAndIdentity(TEST_IDENTITY.uid);

      expect(mockIdentityRepository.find).toHaveBeenCalledWith(TEST_IDENTITY.uid, undefined);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(TEST_IDENTITY.userId);
      expect(result).toEqual(TEST_USER);
    });

    it("should return null when identity does not exist", async () => {
      mockIdentityRepository.find.mockResolvedValue(null);

      const result = await service.deleteUserAndIdentity("nonexistent-uid");

      expect(mockIdentityRepository.find).toHaveBeenCalledWith("nonexistent-uid", undefined);
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
      (auth.deleteUser as jest.Mock).mockResolvedValue(undefined);

      await service.deleteFirebaseAuthUser(TEST_IDENTITY.uid);

      expect(auth.deleteUser).toHaveBeenCalledWith(TEST_IDENTITY.uid);
    });

    it("should silently succeed when user is not found in global project (pre-migration user)", async () => {
      const error = Object.assign(new Error("User not found"), { code: "auth/user-not-found" });
      (auth.deleteUser as jest.Mock).mockRejectedValue(error);

      await expect(service.deleteFirebaseAuthUser(TEST_IDENTITY.uid)).resolves.toBeUndefined();
    });

    it("should throw an error when Firebase user deletion fails for other reasons", async () => {
      const error = new Error("Firebase user deletion failed");
      (auth.deleteUser as jest.Mock).mockRejectedValue(error);

      await expect(
        service.deleteFirebaseAuthUser(TEST_IDENTITY.uid),
      ).rejects.toThrow("Firebase user deletion failed");
    });
  });

  describe("fetchNewIdToken", () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should successfully fetch new ID token", async () => {
      const mockResponse = {
        id_token: "new-id-token",
        refresh_token: "new-refresh-token",
        expires_in: "3600",
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await service.fetchNewIdToken("test-refresh-token");

      expect(global.fetch).toHaveBeenCalledWith(
        `https://securetoken.googleapis.com/v1/token?key=${process.env.FIREBASE_TOKEN_API_KEY}`,
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

    it("should throw error when HTTP request fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: jest.fn().mockResolvedValue("Invalid refresh token"),
      });

      await expect(
        service.fetchNewIdToken("invalid-refresh-token")
      ).rejects.toThrow("Firebase token refresh failed: 400 Bad Request");
    });

    it("should handle network errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(
        service.fetchNewIdToken("test-refresh-token")
      ).rejects.toThrow("Network error");
    });

    it("should handle JSON parsing errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      });

      await expect(
        service.fetchNewIdToken("test-refresh-token")
      ).rejects.toThrow("Invalid JSON");
    });

    it("should handle different HTTP error codes", async () => {
      const errorCodes = [401, 403, 500, 503];

      for (const code of errorCodes) {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status: code,
          statusText: `Error ${code}`,
          text: jest.fn().mockResolvedValue(`Server error ${code}`),
        });

        await expect(
          service.fetchNewIdToken("test-refresh-token")
        ).rejects.toThrow(`Firebase token refresh failed: ${code} Error ${code}`);
      }
    });

    it("should handle missing environment variable", async () => {
      const originalEnv = process.env.FIREBASE_TOKEN_API_KEY;
      delete process.env.FIREBASE_TOKEN_API_KEY;

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      await service.fetchNewIdToken("test-refresh-token");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://securetoken.googleapis.com/v1/token?key=undefined",
        expect.any(Object),
      );

      process.env.FIREBASE_TOKEN_API_KEY = originalEnv;
    });
  });
});
