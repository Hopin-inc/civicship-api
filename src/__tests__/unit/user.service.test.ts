import UserRepository from "@/application/domain/user/data/repository";
import UserService from "@/application/domain/user/service";
import { AuthorizationError, NotFoundError, ValidationError } from "@/errors/graphql";
import { GqlQueryUsersArgs, GqlSortDirection } from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

jest.mock("@/application/domain/user/data/repository");

describe("UserService", () => {
  const TEST_USER_ID = "test-user";
  const TEST_USER = {
    id: TEST_USER_ID,
    name: "Test User",
    email: "test@example.com",
    slug: "test-user",
    role: "MEMBER",
  };

  const MOCK_USERS = [
    { id: "1", name: "User 1", email: "user1@example.com" },
    { id: "2", name: "User 2", email: "user2@example.com" },
  ];

  const DEFAULT_PAGINATION: GqlQueryUsersArgs = {
    cursor: "1",
    filter: {},
    sort: {},
  };

  const COMMUNITY_PAGINATION: GqlQueryUsersArgs = {
    cursor: "1",
    filter: { keyword: "community-1" },
    sort: {},
  };

  const DEFAULT_LIMIT = 2;

  const mockCtx = {
    currentUser: { id: TEST_USER_ID },
    uid: TEST_USER_ID,
  } as IContext;

  const mockTx = {} as Prisma.TransactionClient;

  const mockFunctions = {
    find: (result: typeof TEST_USER | null) =>
      (UserRepository.find as jest.Mock).mockResolvedValue(result),

    query: (result: typeof MOCK_USERS | []) =>
      (UserRepository.query as jest.Mock).mockResolvedValue(result),

    updateProfile: (result: typeof TEST_USER | Promise<never>) =>
      (UserRepository.updateProfile as jest.Mock).mockResolvedValue(result),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFunctions.find(TEST_USER);
    mockFunctions.query(MOCK_USERS);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("findUser", () => {
    it("should return a user when user exists", async () => {
      const result = await UserService.findUser(mockCtx, TEST_USER_ID);

      expect(UserRepository.find).toHaveBeenCalledWith(mockCtx, TEST_USER_ID);
      expect(result).toEqual(TEST_USER);
    });

    it("should return null when user does not exist", async () => {
      const nonExistentId = "non-existent";
      mockFunctions.find(null);

      const result = await UserService.findUser(mockCtx, nonExistentId);

      expect(UserRepository.find).toHaveBeenCalledWith(mockCtx, nonExistentId);
      expect(result).toBeNull();
    });
  });

  describe("fetchUsers", () => {
    it("should return a list of users when users exist", async () => {
      const result = await UserService.fetchUsers(mockCtx, DEFAULT_PAGINATION, DEFAULT_LIMIT);

      expect(UserRepository.query).toHaveBeenCalledWith(
        mockCtx,
        { AND: [{}, {}] },
        { createdAt: "desc" },
        DEFAULT_LIMIT,
        DEFAULT_PAGINATION.cursor,
      );
      expect(result).toEqual(MOCK_USERS);
    });

    it("should return an empty list when no users exist", async () => {
      mockFunctions.query([]);

      const result = await UserService.fetchUsers(mockCtx, DEFAULT_PAGINATION, DEFAULT_LIMIT);

      expect(UserRepository.query).toHaveBeenCalledWith(
        mockCtx,
        { AND: [{}, {}] },
        { createdAt: "desc" },
        DEFAULT_LIMIT,
        DEFAULT_PAGINATION.cursor,
      );
      expect(result).toEqual([]);
    });

    it("should apply filter and sort conditions correctly", async () => {
      const customPagination: GqlQueryUsersArgs = {
        cursor: "1",
        filter: { keyword: "test", sysRole: "USER" },
        sort: { createdAt: GqlSortDirection.Desc },
      };

      await UserService.fetchUsers(mockCtx, customPagination, DEFAULT_LIMIT);

      expect(UserRepository.query).toHaveBeenCalledWith(
        mockCtx,
        {
          AND: [
            { sysRole: "USER" },
            {
              OR: [{ name: { contains: "test" } }, { slug: { contains: "test" } }],
            },
          ],
        },
        { createdAt: "desc" },
        DEFAULT_LIMIT,
        customPagination.cursor,
      );
    });
  });

  describe("fetchCommunityMembers", () => {
    it("should return a list of community members when members exist", async () => {
      const result = await UserService.fetchCommunityMembers(
        mockCtx,
        COMMUNITY_PAGINATION,
        DEFAULT_LIMIT,
      );

      expect(UserRepository.query).toHaveBeenCalledWith(
        mockCtx,
        {
          AND: [
            {},
            {
              OR: [{ name: { contains: "community-1" } }, { slug: { contains: "community-1" } }],
            },
          ],
        },
        { createdAt: "desc" },
        DEFAULT_LIMIT,
        COMMUNITY_PAGINATION.cursor,
      );
      expect(result).toEqual(MOCK_USERS);
    });

    it("should return an empty list when no community members exist", async () => {
      mockFunctions.query([]);

      const result = await UserService.fetchCommunityMembers(
        mockCtx,
        COMMUNITY_PAGINATION,
        DEFAULT_LIMIT,
      );

      expect(UserRepository.query).toHaveBeenCalledWith(
        mockCtx,
        {
          AND: [
            {},
            {
              OR: [{ name: { contains: "community-1" } }, { slug: { contains: "community-1" } }],
            },
          ],
        },
        { createdAt: "desc" },
        DEFAULT_LIMIT,
        COMMUNITY_PAGINATION.cursor,
      );
      expect(result).toEqual([]);
    });
  });

  describe("updateProfile", () => {
    const updateInput = {
      id: TEST_USER_ID,
      name: "Updated User",
      email: "updated@example.com",
      slug: "updated-user",
    };

    const updatePermission = {
      userId: TEST_USER_ID,
    };

    const updatedUser = {
      ...TEST_USER,
      ...updateInput,
    };

    it("should update user profile when user exists", async () => {
      mockFunctions.updateProfile(updatedUser);

      const result = await UserService.updateProfile(
        mockCtx,
        { input: updateInput, permission: updatePermission },
        mockTx,
      );

      expect(UserRepository.updateProfile).toHaveBeenCalledWith(
        mockCtx,
        TEST_USER_ID,
        {
          ...updateInput,
          image: { create: undefined },
        },
        mockTx,
      );
      expect(result).toEqual(updatedUser);
    });

    it("should throw NotFoundError when user does not exist", async () => {
      const nonExistentInput = {
        ...updateInput,
        id: "non-existent",
      };
      const nonExistentPermission = {
        ...updatePermission,
        userId: "non-existent",
      };
      mockFunctions.updateProfile(Promise.reject(new NotFoundError("User not found")));

      await expect(
        UserService.updateProfile(
          mockCtx,
          { input: nonExistentInput, permission: nonExistentPermission },
          mockTx,
        ),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ValidationError when input is invalid", async () => {
      const invalidInput = {
        ...updateInput,
        email: "invalid-email",
      };

      mockFunctions.updateProfile(Promise.reject(new ValidationError("Invalid email format")));

      await expect(
        UserService.updateProfile(
          mockCtx,
          { input: invalidInput, permission: updatePermission },
          mockTx,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw AuthorizationError when user lacks permission", async () => {
      const unauthorizedPermission = {
        userId: "other-user",
      };

      mockFunctions.updateProfile(
        Promise.reject(new AuthorizationError("Unauthorized to update profile")),
      );

      await expect(
        UserService.updateProfile(
          mockCtx,
          { input: updateInput, permission: unauthorizedPermission },
          mockTx,
        ),
      ).rejects.toThrow(AuthorizationError);
    });
  });
});
