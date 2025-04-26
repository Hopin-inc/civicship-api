import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { CurrentPrefecture, MembershipStatus, MembershipStatusReason, Role } from "@prisma/client";
import { IContext } from "@/types/server";
import membershipResolver from "@/application/domain/account/membership/controller/resolver";
import NotificationService from "@/application/domain/notification/service";
import WalletService from "@/application/domain/account/wallet/service";

jest.mock("@/application/domain/notification/service");
jest.mock("@/application/domain/account/wallet/service");

describe("Membership Accept My Invitation Tests", () => {
  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should accept invitation, join community, create wallet, and switch rich menu", async () => {
    // Arrange
    const user = await TestDataSourceHelper.createUser({
      name: "InvitedUser",
      slug: "invited-user-slug",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const ctx = { currentUser: { id: user.id } } as IContext;

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

    // Act
    const result = await membershipResolver.Mutation.membershipAcceptMyInvitation(
      {},
      { input, permission: { userId: ctx.currentUser!.id } },
      ctx,
    );

    // Assert
    const updatedMembership = await TestDataSourceHelper.findMembership({
      userId_communityId: {
        userId: user.id,
        communityId: community.id,
      },
    });

    expect(updatedMembership?.status).toBe(MembershipStatus.JOINED);

    expect(result.membership?.user.id).toBe(user.id);
    expect(result.membership?.community.id).toBe(community.id);
    expect(result.membership?.status).toBe("JOINED");

    // Wallet作成が呼ばれていること
    expect(WalletService.createMemberWalletIfNeeded).toHaveBeenCalledTimes(1);
    expect(WalletService.createMemberWalletIfNeeded).toHaveBeenCalledWith(
      expect.any(Object), // ctx
      user.id,
      community.id,
      expect.any(Object), // tx
    );

    // リッチメニュー切り替えが呼ばれていること
    expect(NotificationService.switchRichMenuByRole).toHaveBeenCalledTimes(1);
    expect(NotificationService.switchRichMenuByRole).toHaveBeenCalledWith(
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
    const ctx = { currentUser: { id: user.id } } as IContext;

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

    const result = await membershipResolver.Mutation.membershipAcceptMyInvitation(
      {},
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
    const ctx = { currentUser: { id: user.id } } as IContext;

    const community = await TestDataSourceHelper.createCommunity({
      name: "community-invite",
      pointName: "c-point",
    });

    const input = { userId: user.id, communityId: community.id };

    const result = await membershipResolver.Mutation.membershipAcceptMyInvitation(
      {},
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
