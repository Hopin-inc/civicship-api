import { CurrentPrefecture, IdentityPlatform } from "@prisma/client";
import UserRepository from "@/application/domain/user/data/repository";
import IdentityService from "@/application/domain/user/identity/service";
import IdentityRepository from "@/application/domain/user/identity/data/repository";
import { auth } from "@/infrastructure/libs/firebase";

jest.mock("@/infrastructure/libs/firebase", () => ({
  auth: {
    deleteUser: jest.fn(),
  },
}));
jest.mock("@/application/domain/user/data/repository");
jest.mock("@/application/domain/user/identity/data/repository");

describe("IdentityService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUserAndIdentity", () => {
    it("should create a user with identity", async () => {
      const mockData = {
        name: "Test User",
        email: "test@example.com",
        slug: "slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      };
      const mockUser = { id: "1", ...mockData };
      const uid = "test-uid";
      const platform = IdentityPlatform.FACEBOOK;

      (UserRepository.createWithIdentity as jest.Mock).mockResolvedValue(mockUser);

      const result = await IdentityService.createUserAndIdentity(mockData, uid, platform);

      expect(UserRepository.createWithIdentity).toHaveBeenCalledWith({
        ...mockData,
        identities: { create: { uid, platform } },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("deleteUserAndIdentity", () => {
    it("should delete user and identity when identity exists", async () => {
      const mockIdentity = { userId: "1", uid: "test-uid", platform: IdentityPlatform.LINE };
      const mockUser = { id: "1", name: "Test User" };

      (IdentityRepository.find as jest.Mock).mockResolvedValue(mockIdentity);
      (UserRepository.deleteWithIdentity as jest.Mock).mockResolvedValue(mockUser);

      const result = await IdentityService.deleteUserAndIdentity("test-uid");

      expect(IdentityRepository.find).toHaveBeenCalledWith("test-uid");
      expect(UserRepository.deleteWithIdentity).toHaveBeenCalledWith(mockIdentity.userId);
      expect(result).toEqual(mockUser);
    });

    it("should return null when identity does not exist", async () => {
      (IdentityRepository.find as jest.Mock).mockResolvedValue(null);

      const result = await IdentityService.deleteUserAndIdentity("nonexistent-uid");

      expect(IdentityRepository.find).toHaveBeenCalledWith("nonexistent-uid");
      expect(result).toBeNull();
    });
  });

  describe("deleteFirebaseAuthUser", () => {
    it("should delete the Firebase auth user", async () => {
      const uid = "test-uid";

      (auth.deleteUser as jest.Mock).mockResolvedValue(undefined);

      await IdentityService.deleteFirebaseAuthUser(uid);

      expect(auth.deleteUser).toHaveBeenCalledWith(uid);
    });
  });
});
