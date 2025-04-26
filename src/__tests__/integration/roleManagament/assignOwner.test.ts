import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { CurrentPrefecture, MembershipStatus, MembershipStatusReason, Role } from "@prisma/client";
import { IContext } from "@/types/server";
import membershipResolver from "@/application/domain/account/membership/controller/resolver";
import NotificationService from "@/application/domain/notification/service";

jest.mock("@/application/domain/notification/service");

describe("Membership Assign Owner Tests", () => {
  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks(); // モック呼び出しリセット
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
    const result = await membershipResolver.Mutation.membershipAssignOwner(
      {},
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

    expect(result.membership?.user.id).toBe(user.id);
    expect(result.membership?.community.id).toBe(community.id);
    expect(result.membership?.role).toBe("OWNER");

    // 🔥 リッチメニュー切り替えが呼ばれたことを検証！
    expect(NotificationService.switchRichMenuByRole).toHaveBeenCalledTimes(1);
    expect(NotificationService.switchRichMenuByRole).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id,
        communityId: community.id,
        role: Role.OWNER,
      }),
    );
  });
});
