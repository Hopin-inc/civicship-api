import UserService from "@/app/user/service";
import UserRepository from "@/infra/repositories/user";
import { IContext } from "@/types/server";

jest.mock("@/infra/repositories/user");

describe("UserService", () => {
    let ctx: IContext;

    beforeEach(() => {
        ctx = { user: { id: "test-user" }, uid: "test-user" } as unknown as IContext;
        jest.clearAllMocks();
    });


    describe("findUser", () => {
        it("should return a user by id", async () => {
            const mockUser = { id: "1", name: "User 1", email: "user1@example.com" };

            (UserRepository.find as jest.Mock).mockResolvedValue(mockUser);

            const result = await UserService.findUser(ctx, "1");

            expect(UserRepository.find).toHaveBeenCalledWith(ctx, "1");
            expect(result).toEqual(mockUser);
        });
    });
});
