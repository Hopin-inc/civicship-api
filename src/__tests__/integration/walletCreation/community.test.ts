// import communityResolver from "@/presentation/graphql/resolvers/community";
// import TestDataSourceHelper from "../../helper/test-data-source-helper";
// import { IContext } from "@/types/server";
// import { GqlCommunityCreateInput } from "@/types/graphql";
//
// describe("Community Integration Tests", () => {
//     beforeEach(async () => {
//         await TestDataSourceHelper.deleteAll();
//         TestDataSourceHelper.disconnect();
//     });
//
//     afterAll(async () => {
//         TestDataSourceHelper.disconnect();
//     });
//
//     describe("create community", () => {
//         it("should create a member wallet if not existed", async () => {
//             //////////////////////////////////////////////////
//             // insert seed data
//             //////////////////////////////////////////////////
//             const name = "John Doe"
//             const slug = "user-1-slug"
//             const createUserInput = {
//                 name: name,
//                 slug: slug,
//                 image: undefined
//             }
//             const userInserted = await TestDataSourceHelper.create(createUserInput);
//             const userId = userInserted.id;
//
//             const ctx = { currentUser: { id: userId } } as unknown as IContext;
//
//             //////////////////////////////////////////////////
//             // construct request
//             //////////////////////////////////////////////////
//             const communityName = "community-1";
//             const pointName = "community-1-point";
//
//             const createCommunityInput: GqlCommunityCreateInput = {
//                 name: communityName,
//                 pointName: pointName,
//                 image: undefined,
//                 bio: undefined,
//                 establishedAt: undefined,
//                 website: undefined
//             };
//
//             //////////////////////////////////////////////////
//             // execute
//             //////////////////////////////////////////////////
//             await communityResolver.Mutation.communityCreate(
//                 {},
//                 {
//                     input: createCommunityInput
//                 },
//                 ctx
//             );
//
//             //////////////////////////////////////////////////
//             // assert result
//             //////////////////////////////////////////////////
//             const communityActual = await TestDataSourceHelper.findAllCommunity();
//
//             // communityが作成されていること
//             expect(communityActual).toHaveLength(1);
//
//             const communityId = communityActual[0].id
//
//             // community walletが作成されていること
//             const communityWalletActual = await TestDataSourceHelper.findCommunityWallet(communityId)
//             expect(communityWalletActual).toBeDefined()
//         });
//     })
// })
