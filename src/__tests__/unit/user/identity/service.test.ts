import { IdentityPlatform } from "@prisma/client";
import UserRepository from "@/application/domain/user/data/repository";
import IdentityService from "@/application/domain/user/identity/service";
import IdentityRepository from "@/application/domain/user/identity/data/repository";
import { auth } from "@/infrastructure/libs/firebase";
import {
  mockFunctions,
  TEST_IDENTITY,
  TEST_USER,
  TEST_USER_DATA,
} from "@/__tests__/helper/test-data";

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
    // デフォルトのモック設定
    mockFunctions.createWithIdentity(TEST_USER);
    mockFunctions.findIdentity(TEST_IDENTITY);
    mockFunctions.deleteWithIdentity(TEST_USER);
    mockFunctions.deleteFirebaseUser();
  });

  /**
   * createUserAndIdentity はユーザーとアイデンティティを同時に作成するメソッド
   * - ユーザー情報とアイデンティティ情報を同時に作成
   * - 作成されたユーザー情報を返却
   */
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

  /**
   * deleteUserAndIdentity はユーザーとアイデンティティを削除するメソッド
   * - アイデンティティの存在確認
   * - ユーザーとアイデンティティの削除
   * - 削除されたユーザー情報を返却
   */
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

  /**
   * deleteFirebaseAuthUser はFirebase認証ユーザーを削除するメソッド
   * - Firebase認証ユーザーの削除
   */
  describe("deleteFirebaseAuthUser", () => {
    it("should delete the Firebase auth user successfully", async () => {
      await IdentityService.deleteFirebaseAuthUser(TEST_IDENTITY.uid);

      expect(auth.deleteUser).toHaveBeenCalledWith(TEST_IDENTITY.uid);
    });

    it("should throw an error when Firebase user deletion fails", async () => {
      const error = new Error("Firebase user deletion failed");
      (auth.deleteUser as jest.Mock).mockRejectedValue(error);

      await expect(IdentityService.deleteFirebaseAuthUser(TEST_IDENTITY.uid)).rejects.toThrow(
        "Firebase user deletion failed",
      );
    });
  });
});
