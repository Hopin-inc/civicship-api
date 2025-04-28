import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { CurrentPrefecture, MembershipStatus, MembershipStatusReason, Role } from "@prisma/client";
import { IContext } from "@/types/server";
import MembershipUseCase from "@/application/domain/account/membership/usecase";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { container } from "tsyringe";
import WalletService from "@/application/domain/account/wallet/service";
import NotificationService from "@/application/domain/notification/service";
import MembershipService from "@/application/domain/account/membership/service";

// --- Mockクラス ---
class MockWalletService implements Partial<WalletService> {
  createMemberWalletIfNeeded = jest.fn();
}

class MockNotificationService implements Partial<NotificationService> {
  switchRichMenuByRole = jest.fn();
}

// --- テスト ---
describe("Membership Assign Member Tests", () => {
  let membershipUseCase: MembershipUseCase;
  let walletServiceMock: MockWalletService;
  let notificationServiceMock: MockNotificationService;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();

    const issuer = new PrismaClientIssuer();
    const membershipService = container.resolve(MembershipService);
    walletServiceMock = new MockWalletService();
    notificationServiceMock = new MockNotificationService();

    container.register("WalletService", { useValue: walletServiceMock });
    container.register("NotificationService", { useValue: notificationServiceMock });

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

  it("should assign member role to membership and switch rich menu", async () => {
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
      role: Role.MANAGER, // MANAGERからMEMBERに変更させる
    });

    const input = {
      userId: user.id,
      communityId: community.id,
    };

    // Act
    const result = await membershipUseCase.managerAssignMember(
      { input, permission: { communityId: community.id } },
      ctx,
    );

    // Assert
    const updatedMembership = await TestDataSourceHelper.findMembership({
      userId_communityId: { userId: user.id, communityId: community.id },
    });

    expect(updatedMembership?.role).toBe(Role.MEMBER);
    expect(result.membership?.role).toBe("MEMBER");

    // 🔥 NotificationService（mock）でswitchRichMenuByRoleが呼ばれたことを検証！
    expect(notificationServiceMock.switchRichMenuByRole).toHaveBeenCalledTimes(1);
    expect(notificationServiceMock.switchRichMenuByRole).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id,
        communityId: community.id,
        role: Role.MEMBER,
      }),
    );
  });
});
