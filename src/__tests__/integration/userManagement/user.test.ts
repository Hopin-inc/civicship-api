import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { GqlUserUpdateProfileInput } from "@/types/graphql";
import userResolver from "@/application/domain/user/controller/resolver";
import { CurrentPrefecture } from "@prisma/client";

describe("User Integration Tests", () => {
  jest.setTimeout(30_000);

  beforeAll(async () => {
    await TestDataSourceHelper.deleteAll();
    await TestDataSourceHelper.disconnect();
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should update user profile", async () => {
    //////////////////////////////////////////////////
    // insert seed data
    //////////////////////////////////////////////////
    const nameBefore = "John Doe";
    const slugBefore = "user-1-slug";

    const createUserInput = {
      name: nameBefore,
      slug: slugBefore,
      image: undefined,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    };

    const inserted = await TestDataSourceHelper.createUser(createUserInput);

    //////////////////////////////////////////////////
    // constract request
    //////////////////////////////////////////////////
    const userId = inserted.id;
    const nameAfter = nameBefore + "-after";
    const slugAfter = slugBefore + "-after";

    const ctx = { uid: userId } as unknown as IContext;

    const input: GqlUserUpdateProfileInput = {
      name: nameAfter,
      slug: slugAfter,
      image: undefined,
      bio: undefined,
      urlWebsite: undefined,
      urlX: undefined,
      urlFacebook: undefined,
      urlInstagram: undefined,
      urlYoutube: undefined,
      urlTiktok: undefined,
    };

    //////////////////////////////////////////////////
    // execute
    //////////////////////////////////////////////////
    await userResolver.Mutation.userUpdateMyProfile(
      {},
      { input: input, permission: { userId } },
      ctx,
    );

    //////////////////////////////////////////////////
    // assert result
    //////////////////////////////////////////////////
    const users = await TestDataSourceHelper.findAll();
    const queried = users.filter((u) => u.id === userId);
    const actual = queried[0];

    // レコードが1件だけであること
    expect(queried.length).toEqual(1);
    // nameが更新後の値になっていること
    expect(actual.name).toEqual(nameAfter);
    // slugが更新後の値になっていること
    expect(actual.slug).toEqual(slugAfter);
  });
});
