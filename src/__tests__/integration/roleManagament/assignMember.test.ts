import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { CurrentPrefecture, MembershipStatus, MembershipStatusReason, Role } from "@prisma/client";
import { IContext } from "@/types/server";
import MembershipUseCase from "@/application/domain/account/membership/usecase";
import { container } from "tsyringe";
import WalletService from "@/application/domain/account/wallet/service";
import NotificationService from "@/application/domain/notification/service";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

class MockWalletService implements Partial<WalletService> {
  createMemberWalletIfNeeded = jest.fn();
}

class MockNotificationService implements Partial<NotificationService> {
  switchRichMenuByRole = jest.fn();
}

describe("Membership Integration: Assign Member", () => {
  let membershipUseCase: MembershipUseCase;
  let walletServiceMock: MockWalletService;
  let notificationServiceMock: MockNotificationService;
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();

    walletServiceMock = new MockWalletService();
    notificationServiceMock = new MockNotificationService();

    container.register("WalletService", { useValue: walletServiceMock });
    container.register("NotificationService", { useValue: notificationServiceMock });

    issuer = container.resolve(PrismaClientIssuer);
    membershipUseCase = container.resolve(MembershipUseCase);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should assign member role to membership and switch rich menu", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "User",
      slug: "user-slug",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const community = await TestDataSourceHelper.createCommunity({
      name: "community-assign",
      pointName: "c-point",
    });

    const ctx = {
      currentUser: { id: user.id },
      issuer,
    } as unknown as IContext;

    await TestDataSourceHelper.createMembership({
      user: { connect: { id: user.id } },
      community: { connect: { id: community.id } },
      status: MembershipStatus.JOINED,
      reason: MembershipStatusReason.INVITED,
      role: Role.MANAGER,
    });

    const input = {
      userId: user.id,
      communityId: community.id,
    };

    const result = await membershipUseCase.managerAssignMember(
      { input, permission: { communityId: community.id } },
      ctx,
    );

    const updatedMembership = await TestDataSourceHelper.findMembership({
      userId_communityId: { userId: user.id, communityId: community.id },
    });

    expect(updatedMembership?.role).toBe(Role.MEMBER);
    expect(result.membership?.role).toBe("MEMBER");

    expect(notificationServiceMock.switchRichMenuByRole).toHaveBeenCalledTimes(1);
    expect(notificationServiceMock.switchRichMenuByRole).toHaveBeenCalledWith(
      expect.objectContaining({
        currentUser: { id: user.id },
        issuer: expect.any(Object),
      }),
      expect.objectContaining({
        userId: user.id,
        communityId: community.id,
        role: "MEMBER",
      }),
    );
  });
});
