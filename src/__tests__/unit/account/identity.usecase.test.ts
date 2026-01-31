import "reflect-metadata";
import IdentityUseCase from "@/application/domain/account/identity/usecase";
import { GqlIdentityPlatform, GqlPhoneUserStatus } from "@/types/graphql";
import { IContext } from "@/types/server";
import { Role } from "@prisma/client";

describe("IdentityUseCase", () => {
  // Mock dependencies
  const mockIdentityService = {
    linkPhoneIdentity: jest.fn(),
    deleteUserAndIdentity: jest.fn(),
    deleteFirebaseAuthUser: jest.fn(),
    storeAuthTokens: jest.fn(),
    createUserAndIdentity: jest.fn(),
    findUserByIdentity: jest.fn(),
    addIdentityToUser: jest.fn(),
  };

  const mockMembershipService = {
    fetchMemberships: jest.fn(),
    findMembershipDetail: jest.fn(),
    inviteMember: jest.fn(),
    setStatus: jest.fn(),
    joinIfNeeded: jest.fn(),
    deleteMembership: jest.fn(),
    setRole: jest.fn(),
    findMembership: jest.fn(),
  };

  const mockWalletService = {
    createMemberWalletIfNeeded: jest.fn(),
    deleteMemberWallet: jest.fn(),
  };

  const mockImageService = {
    uploadPublicImage: jest.fn(),
  };

  const mockIncentiveGrantService = {
    grantSignupBonusIfEnabled: jest.fn(),
  };

  const mockTransactionService = {
    refreshCurrentPoint: jest.fn(),
  };

  const mockNotificationService = {
    switchRichMenuByRole: jest.fn(),
    pushSignupBonusGrantedMessage: jest.fn(),
  };

  const mockCommunityService = {
    findCommunityOrThrow: jest.fn(),
  };

  let useCase: IdentityUseCase;
  let mockContext: IContext;

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new IdentityUseCase(
      mockIdentityService as any,
      mockMembershipService as any,
      mockWalletService as any,
      mockImageService as any,
      mockIncentiveGrantService as any,
      mockTransactionService as any,
      mockNotificationService as any,
      mockCommunityService as any,
    );

    mockContext = {
      uid: "test-uid",
      platform: GqlIdentityPlatform.Line,
      communityId: "test-community",
      issuer: {
        public: jest.fn((ctx, callback) => callback(null)), // Mock public transaction to just execute callback
        internal: jest.fn((callback) => callback(null)),
        onlyBelongingCommunity: jest.fn((ctx, callback) => callback(null)),
      },
      currentUser: { id: "user-1", role: Role.MEMBER },
    } as any;
  });

  describe("checkPhoneUser", () => {
    const TEST_PHONE_UID = "phone-uid-1";
    const TEST_USER_ID = "user-1";
    const TEST_COMMUNITY_ID = "test-community";

    it("should grant signup bonus when creating new membership for existing LINE user (Scenario 1)", async () => {
      // Setup
      const existingUser = { id: TEST_USER_ID };
      const newMembership = { userId: TEST_USER_ID, communityId: TEST_COMMUNITY_ID };
      const transaction = { id: "tx-1", toPointChange: 100, comment: "Bonus" };
      const community = { name: "Test Community" };

      // User exists via LINE identity (ctx.uid)
      mockIdentityService.findUserByIdentity.mockImplementation((ctx, uid, cid) => {
        if (uid === TEST_PHONE_UID) return null; // No phone user yet
        if (uid === mockContext.uid && cid === mockContext.communityId) return existingUser; // LINE user exists
        return null;
      });

      // No existing membership
      mockMembershipService.findMembership.mockResolvedValue(null);

      // Mocks for creation flow
      mockIdentityService.linkPhoneIdentity.mockResolvedValue(undefined);
      mockMembershipService.joinIfNeeded.mockResolvedValue(newMembership);
      mockWalletService.createMemberWalletIfNeeded.mockResolvedValue(undefined);

      // Mock signup bonus grant
      mockIncentiveGrantService.grantSignupBonusIfEnabled.mockResolvedValue({
        granted: true,
        transaction: transaction,
      });

      mockCommunityService.findCommunityOrThrow.mockResolvedValue(community);

      // Execute
      const result = await useCase.checkPhoneUser(mockContext, { input: { phoneUid: TEST_PHONE_UID } });

      // Verify
      expect(result.status).toBe(GqlPhoneUserStatus.ExistingDifferentCommunity);
      expect(mockIncentiveGrantService.grantSignupBonusIfEnabled).toHaveBeenCalledWith(
        mockContext,
        TEST_USER_ID,
        TEST_COMMUNITY_ID,
        `${TEST_USER_ID}_${TEST_COMMUNITY_ID}`,
        null, // Transaction mock passed null
      );
      expect(mockNotificationService.pushSignupBonusGrantedMessage).toHaveBeenCalledWith(
        mockContext,
        transaction.id,
        transaction.toPointChange,
        transaction.comment,
        community.name,
        TEST_USER_ID,
      );
    });

    it("should grant signup bonus when user exists in another community (Scenario 2)", async () => {
      // Setup
      const existingUser = { id: TEST_USER_ID };
      const newMembership = { userId: TEST_USER_ID, communityId: TEST_COMMUNITY_ID };
      const transaction = { id: "tx-1", toPointChange: 100, comment: "Bonus" };
      const community = { name: "Test Community" };

      // User exists (via phone UID lookup, but no membership in current community)
      mockIdentityService.findUserByIdentity.mockImplementation((ctx, uid, cid) => {
        if (uid === TEST_PHONE_UID && cid === null) return existingUser;
        return null;
      });

      // No existing membership in current community
      mockMembershipService.findMembership.mockResolvedValue(null);

      // Mocks for join flow
      mockIdentityService.addIdentityToUser.mockResolvedValue(undefined);
      mockMembershipService.joinIfNeeded.mockResolvedValue(newMembership);
      mockWalletService.createMemberWalletIfNeeded.mockResolvedValue(undefined);

      // Mock signup bonus grant
      mockIncentiveGrantService.grantSignupBonusIfEnabled.mockResolvedValue({
        granted: true,
        transaction: transaction,
      });

      mockCommunityService.findCommunityOrThrow.mockResolvedValue(community);

      // Execute
      const result = await useCase.checkPhoneUser(mockContext, { input: { phoneUid: TEST_PHONE_UID } });

      // Verify
      expect(result.status).toBe(GqlPhoneUserStatus.ExistingDifferentCommunity);
      expect(mockIncentiveGrantService.grantSignupBonusIfEnabled).toHaveBeenCalledWith(
        mockContext,
        TEST_USER_ID,
        TEST_COMMUNITY_ID,
        `${TEST_USER_ID}_${TEST_COMMUNITY_ID}`,
        null, // Transaction mock passed null
      );
      expect(mockNotificationService.pushSignupBonusGrantedMessage).toHaveBeenCalledWith(
        mockContext,
        transaction.id,
        transaction.toPointChange,
        transaction.comment,
        community.name,
        TEST_USER_ID,
      );
    });
  });
});
