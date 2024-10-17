import UserService from "@/domains/user/service";
import UserRepository from "@/domains/user/repository";

jest.mock("@/domains/user/repository");

describe("UserService.findUser", () => {
    const userId = "001";
    const mockUser = { id: "001", name: "John Doe" };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should return user when found", async () => {
        (UserRepository.find as jest.Mock).mockResolvedValue(mockUser);

        const result = await UserService.findUser(userId);

        expect(UserRepository.find).toHaveBeenCalledWith(userId);
        expect(result).toEqual(mockUser);
    });

    test("should return null when user is not found", async () => {
        (UserRepository.find as jest.Mock).mockResolvedValue(null);

        const result = await UserService.findUser(userId);

        expect(UserRepository.find).toHaveBeenCalledWith(userId);
        expect(result).toBeNull();
    });
});
