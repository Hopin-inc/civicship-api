import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { CurrentPrefecture, MembershipStatus, MembershipStatusReason, Role } from "@prisma/client";
import { IContext } from "@/types/server";
import MembershipUseCase from "@/application/domain/account/membership/usecase";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { createMembershipService } from "@/application/domain/account/membership/provider";

// --- Mockクラス ---
class MockWalletService {
  createMemberWalletIfNeeded = jest.fn();
}
class MockNotificationService {
  switchRichMenuByRole = jest.fn();
}

// --- テスト ---
describe("Membership Assign Owner Tests", () => {
  let membershipUseCase: MembershipUseCase;
  let walletServiceMock: MockWalletService;
  let notificationServiceMock: MockNotificationService;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();

    const issuer = new PrismaClientIssuer();
    const membershipService = createMembershipService(issuer);
    walletServiceMock = new MockWalletService();
    notificationServiceMock = new MockNotificationService();

    membershipUseCase = new MembershipUseCase(
      issuer,
      membershipService,
      walletServiceMock as any,
      notificationServiceMock as any,
    );
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should assign owner role to membership and switch rich menu", async () => {
    // Arrange
    const user = await TestDataSourceHelper.createUser({
      name: "User",
      slug: "user-slug",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const ctx = { currentUser: { id: user.id } } as IContext;

    const community = await TestDataSourceHelper.createCommunity({
      name: "community-assign",
      pointName: "c-point",
    });

    await TestDataSourceHelper.createMembership({
      user: { connect: { id: user.id } },
      community: { connect: { id: community.id } },
      status: MembershipStatus.JOINED,
      reason: MembershipStatusReason.INVITED,
      role: Role.MEMBER, // 初期はMEMBER
    });

    const input = {
      userId: user.id,
      communityId: community.id,
    };

    // Act
    const result = await membershipUseCase.ownerAssignOwner(
      { input, permission: { communityId: community.id } },
      ctx,
    );

    // Assert
    const updatedMembership = await TestDataSourceHelper.findMembership({
      userId_communityId: {
        userId: user.id,
        communityId: community.id,
      },
    });

    expect(updatedMembership?.role).toBe(Role.OWNER);
    expect(result.membership?.role).toBe("OWNER");

    // 🔥 リッチメニュー切り替えが呼ばれたことを検証！
    expect(notificationServiceMock.switchRichMenuByRole).toHaveBeenCalledTimes(1);
    expect(notificationServiceMock.switchRichMenuByRole).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id,
        communityId: community.id,
        role: Role.OWNER,
      }),
    );
  });
});
