// import userResolver from "@/presentation/graphql/resolvers/user";
// import TestDataSourceHelper from "../../helper/test-data-source-helper";
// import { IContext } from "@/types/server";
// import { GqlUserUpdateProfileInput } from "@/types/graphql";
//
// describe("User Integration Tests", () => {
//     beforeAll(async () => {
//         // clean up data before each test
//         await TestDataSourceHelper.deleteAll();
//         TestDataSourceHelper.disconnect();
//     });
//
//     afterAll(async () => {
//         // close DB transaction after each test
//         TestDataSourceHelper.disconnect();
//     });
//
//     it("should update user profile", async () => {
//         //////////////////////////////////////////////////
//         // insert seed data
//         //////////////////////////////////////////////////
//         const nameBefore = "John Doe"
//         const slugBefore = "user-1-slug"
//
//         const createUserInput = {
//             name: nameBefore,
//             slug: slugBefore,
//             image: undefined
//         }
//
//         const inserted = await TestDataSourceHelper.create(createUserInput);
//
//         //////////////////////////////////////////////////
//         // constract request
//         //////////////////////////////////////////////////
//         const userId = inserted.id;
//         const nameAfter = nameBefore + "-after"
//         const slugAfter = slugBefore + "-after"
//
//         const ctx = { uid: userId } as unknown as IContext;
//
//         const input: GqlUserUpdateProfileInput = {
//             id: userId,
//             name: nameAfter,
//             slug: slugAfter,
//             image: undefined,
//             bio: undefined,
//             urlWebsite: undefined,
//             urlX: undefined,
//             urlFacebook: undefined,
//             urlInstagram: undefined,
//             urlYoutube: undefined,
//             urlTiktok: undefined,
//         }
//
//         //////////////////////////////////////////////////
//         // execute
//         //////////////////////////////////////////////////
//         await userResolver.Mutation.userUpdateMyProfile(
//             {},
//             { input: input },
//             ctx
//         );
//
//         //////////////////////////////////////////////////
//         // assert result
//         //////////////////////////////////////////////////
//         const users = await TestDataSourceHelper.findAll();
//         const queried = users.filter((u) => u.id === userId)
//         const actual = queried[0]
//
//         // レコードが1件だけであること
//         expect(queried.length).toEqual(1);
//         // nameが更新後の値になっていること
//         expect(actual.name).toEqual(nameAfter);
//         // slugが更新後の値になっていること
//         expect(actual.slug).toEqual(slugAfter);
//     });
// });
