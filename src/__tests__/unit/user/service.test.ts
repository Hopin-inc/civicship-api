// import UserService from "@/app/user/service";
// import UserRepository from "@/infra/repositories/user";
// import { IContext } from "@/types/server";
//
// jest.mock("@/infra/repositories/user");
//
// describe("UserService", () => {
//     let ctx: IContext;
//
//     beforeEach(() => {
//         ctx = { user: { id: "test-user" }, uid: "test-user" } as unknown as IContext;
//         jest.clearAllMocks();
//     });
//
//     describe("findUser", () => {
//         it("should return a user by id", async () => {
//             const mockUser = { id: "1", name: "User 1", email: "user1@example.com" };
//
//             (UserRepository.find as jest.Mock).mockResolvedValue(mockUser);
//
//             const result = await UserService.findUser(ctx, "1");
//
//             expect(UserRepository.find).toHaveBeenCalledWith(ctx, "1");
//             expect(result).toEqual(mockUser);
//         });
//     });
//
//     describe("fetchUsers", () => {
//         it("should return a list of users", async () => {
//             const mockUsers = [
//                 { id: "1", name: "User 1", email: "user1@example.com" },
//                 { id: "2", name: "User 2", email: "user2@example.com" },
//             ];
//
//             (UserRepository.query as jest.Mock).mockResolvedValue(mockUsers);
//
//             const result = await UserService.fetchUsers(ctx, { cursor: "1", filter: {}, sort: {} }, 2);
//
//             expect(UserRepository.query).toHaveBeenCalledWith(ctx, expect.anything(), expect.anything(), 2, "1");
//             expect(result).toEqual(mockUsers);
//         });
//     });
//
//     describe("fetchCommunityMembers", () => {
//         it("should return a list of community members", async () => {
//             const mockMembers = [
//                 { id: "1", name: "Member 1", email: "member1@example.com" },
//                 { id: "2", name: "Member 2", email: "member2@example.com" },
//             ];
//
//             (UserRepository.queryOnlyCommunity as jest.Mock).mockResolvedValue(mockMembers);
//
//             const result = await UserService.fetchCommunityMembers(ctx, { cursor: "1", filter: {}, sort: {} }, 2);
//
//             expect(UserRepository.queryOnlyCommunity).toHaveBeenCalledWith(ctx, expect.anything(), expect.anything(), 2, "1");
//             expect(result).toEqual(mockMembers);
//         });
//     });
//
//     describe("updateProfile", () => {
//         it("should update the user's profile", async () => {
//             const mockUserUpdate = { id: "test-user", name: "Updated User", email: "updated@example.com", slug: "slug" };
//             const mockUpdatedUser = { id: "test-user", name: "Updated User", email: "updated@example.com", slug: "slug" };
//
//             (UserRepository.updateProfile as jest.Mock).mockResolvedValue(mockUpdatedUser);
//
//             const result = await UserService.updateProfile(ctx, { input: mockUserUpdate });
//
//             expect(UserRepository.updateProfile).toHaveBeenCalledWith(ctx, "test-user", expect.anything());
//             expect(result).toEqual(mockUpdatedUser);
//         });
//     });
// });
