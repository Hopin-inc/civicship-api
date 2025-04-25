import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { GqlMutationUserSignUpArgs } from "@/types/graphql";
import { CurrentPrefecture, IdentityPlatform } from "@prisma/client";
import identityResolver from "@/application/domain/account/user/identity/controller/resolver";

describe("User SignUp Integration Tests", () => {
  jest.setTimeout(30_000);

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should return user when sign up is successful", async () => {
    const community = await TestDataSourceHelper.createCommunity({ name: "test", pointName: "pt" });

    const uid = "uid-success";
    const ctx = { uid, platform: IdentityPlatform.LINE } as IContext;

    const input: GqlMutationUserSignUpArgs = {
      input: {
        name: "成功ユーザー",
        slug: "success-user",
        currentPrefecture: CurrentPrefecture.KAGAWA,
        communityId: community.id,
      },
    };

    const res = await identityResolver.Mutation.userSignUp({}, input, ctx);

    expect(res.user).toBeDefined();
    expect(res.user?.name).toEqual("成功ユーザー");

    const wallet = await TestDataSourceHelper.findMemberWallet(res.user!.id, community.id);
    expect(wallet).toBeDefined();
  });

  it("should throw error when sign up with non-existent communityId", async () => {
    const uid = "uid-failure";
    const ctx = { uid, platform: IdentityPlatform.LINE } as IContext;

    const input: GqlMutationUserSignUpArgs = {
      input: {
        name: "失敗ユーザー",
        slug: "fail-user",
        currentPrefecture: CurrentPrefecture.KAGAWA,
        communityId: "non-existent-community", // 存在しないIDを明示
      },
    };

    await expect(identityResolver.Mutation.userSignUp({}, input, ctx)).rejects.toThrow(
      "No 'Community' record",
    ); // 期待されるエラーを正確にマッチさせるとより良い
  });
});
