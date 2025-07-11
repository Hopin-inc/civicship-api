import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { CurrentPrefecture, MembershipStatus, MembershipStatusReason, Role } from "@prisma/client";
import { IContext } from "@/types/server";
import MembershipUseCase from "@/application/domain/account/membership/usecase";
import { container } from "tsyringe";
import WalletService from "@/application/domain/account/wallet/service";
import NotificationService from "@/application/domain/notification/service";
import MembershipService from "@/application/domain/account/membership/service";
import { registerProductionDependencies } from "@/application/provider";

class MockWalletService implements Partial<WalletService> {
  createMemberWalletIfNeeded = jest.fn();
}

class MockNotificationService implements Partial<NotificationService> {
  switchRichMenuByRole = jest.fn();
}

describe("Membership Integration: Accept Invitation", () => {
  let membershipUseCase: MembershipUseCase;
  let walletServiceMock: MockWalletService;
  let notificationServiceMock: MockNotificationService;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();

    const membershipService = container.resolve(MembershipService);

    walletServiceMock = new MockWalletService();
    notificationServiceMock = new MockNotificationService();

    container.register("WalletService", { useValue: walletServiceMock });
    container.register("NotificationService", { useValue: notificationServiceMock });


    membershipUseCase = new MembershipUseCase(
      membershipService,
      walletServiceMock as any,
      notificationServiceMock as any,
    );
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should accept invitation, join community, create wallet, and switch rich menu", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "InvitedUser",
      slug: "invited-user-slug",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const ctx = { 
      currentUser: { id: user.id },
      issuer: {
        public: jest.fn().mockImplementation((_, callback) => callback()),
      }
    } as unknown as IContext;

    const community = await TestDataSourceHelper.createCommunity({
      name: "community-invite",
      pointName: "c-point",
    });

    await TestDataSourceHelper.createMembership({
      user: { connect: { id: user.id } },
      community: { connect: { id: community.id } },
      status: MembershipStatus.PENDING,
      reason: MembershipStatusReason.INVITED,
      role: Role.MEMBER,
    });

    const input = {
      userId: user.id,
      communityId: community.id,
    };

    const result = await membershipUseCase.userAcceptMyInvitation(
      { input, permission: { userId: ctx.currentUser!.id } },
      ctx,
    );

    const updatedMembership = await TestDataSourceHelper.findMembership({
      userId_communityId: {
        userId: user.id,
        communityId: community.id,
      },
    });

    expect(updatedMembership?.status).toBe(MembershipStatus.JOINED);

    expect(result.membership?.user?.id).toBe(user.id);
    expect(result.membership?.community?.id).toBe(community.id);
    expect(result.membership?.status).toBe("JOINED");

    expect(walletServiceMock.createMemberWalletIfNeeded).toHaveBeenCalledTimes(1);
    expect(walletServiceMock.createMemberWalletIfNeeded).toHaveBeenCalledWith(
      expect.any(Object),
      user.id,
      community.id,
      expect.any(Object),
    );

    expect(notificationServiceMock.switchRichMenuByRole).toHaveBeenCalledTimes(1);
    expect(notificationServiceMock.switchRichMenuByRole).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id,
        communityId: community.id,
        status: MembershipStatus.JOINED,
      }),
    );
  });

  it("should not change status if already joined", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "InvitedUser",
      slug: "invited-user-slug",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const ctx = { 
      currentUser: { id: user.id },
      issuer: {
        public: jest.fn().mockImplementation((_, callback) => callback()),
      }
    } as unknown as IContext;

    const community = await TestDataSourceHelper.createCommunity({
      name: "community-invite",
      pointName: "c-point",
    });

    await TestDataSourceHelper.createMembership({
      user: { connect: { id: user.id } },
      community: { connect: { id: community.id } },
      status: MembershipStatus.JOINED,
      reason: MembershipStatusReason.ACCEPTED_INVITATION,
      role: Role.MEMBER,
    });

    const input = { userId: user.id, communityId: community.id };

    const result = await membershipUseCase.userAcceptMyInvitation(
      { input, permission: { userId: ctx.currentUser!.id } },
      ctx,
    );

    expect(result.membership?.status).toBe("JOINED");
  });

  it("should create membership if not found and join community", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "InvitedUser",
      slug: "invited-user-slug",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const ctx = { 
      currentUser: { id: user.id },
      issuer: {
        public: jest.fn().mockImplementation((_, callback) => callback()),
      }
    } as unknown as IContext;

    const community = await TestDataSourceHelper.createCommunity({
      name: "community-invite",
      pointName: "c-point",
    });

    const input = { userId: user.id, communityId: community.id };

    const result = await membershipUseCase.userAcceptMyInvitation(
      { input, permission: { userId: ctx.currentUser!.id } },
      ctx,
    );

    const createdMembership = await TestDataSourceHelper.findMembership({
      userId_communityId: {
        userId: user.id,
        communityId: community.id,
      },
    });

    expect(createdMembership).not.toBeNull();
    expect(createdMembership?.status).toBe(MembershipStatus.JOINED);
    expect(result.membership?.status).toBe("JOINED");
  });
});
