import { container } from "tsyringe";
import request from "supertest";
import { createApolloTestServer } from "@/__tests__/helper/test-server";
enum Role {
  OWNER = "OWNER",
  MANAGER = "MANAGER",
  MEMBER = "MEMBER",
}
import path from "path";
import { registerProductionDependencies } from "@/application/provider";

jest.mock("@/presentation/graphql/scalar", () => ({
  __esModule: true,
  default: {},
}));

jest.mock("@/presentation/graphql/schema/esmPath", () => ({
  getESMDirname: jest.fn(() => path.resolve(__dirname, "../../../src/presentation/graphql/schema")),
}));

const queries = {
  transactionIssue: `
    mutation ($input: TransactionIssueCommunityPointInput!, $permission: CheckCommunityPermissionInput!) {
      transactionIssueCommunityPoint(input: $input, permission: $permission) {
        ... on TransactionIssueCommunityPointSuccess {
          transaction { id }
        }
      }
    }`,
  transactionGrant: `
    mutation ($input: TransactionGrantCommunityPointInput!, $permission: CheckCommunityPermissionInput!) {
      transactionGrantCommunityPoint(input: $input, permission: $permission) {
        ... on TransactionGrantCommunityPointSuccess {
          transaction { id }
        }
      }
    }`,
  communityDelete: `
    mutation ($id: ID!, $permission: CheckCommunityPermissionInput!) {
      communityDelete(id: $id, permission: $permission) {
        ... on CommunityDeleteSuccess {
          communityId
        }
      }
    }`,
  membershipAssignOwner: `
    mutation ($input: MembershipSetRoleInput!, $permission: CheckCommunityPermissionInput!) {
      membershipAssignOwner(input: $input, permission: $permission) {
        ... on MembershipSetRoleSuccess {
          membership {
            user { id }
            community { id }
          }
        }
      }
    }`,
  membershipRemove: `
    mutation ($input: MembershipRemoveInput!, $permission: CheckCommunityPermissionInput!) {
      membershipRemove(input: $input, permission: $permission) {
        ... on MembershipRemoveSuccess {
          userId
          communityId
        }
      }
    }`,
};

const variables = {
  issue: {
    input: { toWalletId: "wallet-1", transferPoints: 10 },
    permission: { communityId: "community-1" },
  },
  grant: {
    input: {
      fromWalletId: "wallet-1",
      toUserId: "user-2",
      transferPoints: 10,
      communityId: "community-1",
    },
    permission: { communityId: "community-1" },
  },
  delete: {
    id: "community-1",
    permission: { communityId: "community-1" },
  },
  assignOwner: {
    input: { userId: "user-2", communityId: "community-1" },
    permission: { communityId: "community-1" },
  },
  remove: {
    input: { userId: "user-2", communityId: "community-1" },
    permission: { communityId: "community-1" },
  },
};

const mockTransactionUseCase = {
  ownerIssueCommunityPoint: jest.fn().mockResolvedValue({
    __typename: "TransactionIssueCommunityPointSuccess",
    transaction: {
      __typename: "Transaction",
      id: "mock-tx",
    },
  }),
  ownerGrantCommunityPoint: jest.fn().mockResolvedValue({
    __typename: "TransactionGrantCommunityPointSuccess",
    transaction: {
      __typename: "Transaction",
      id: "mock-tx",
    },
  }),
};
const mockCommunityUseCase = {
  ownerDeleteCommunity: jest.fn().mockResolvedValue({
    __typename: "CommunityDeleteSuccess",
    communityId: "community-1",
  }),
};
const mockMembershipUseCase = {
  ownerAssignOwner: jest.fn().mockResolvedValue({
    __typename: "MembershipSetRoleSuccess",
    membership: {
      user: {
        id: "user-2",
      },
      community: {
        id: "community-1",
      },
    },
  }),
  ownerRemoveMember: jest.fn().mockResolvedValue({
    __typename: "MembershipRemoveSuccess",
    userId: "user-2",
    communityId: "community-1",
  }),
};

describe("Owner-only mutations - AuthZ", () => {
  beforeAll(() => {
    container.reset();
    registerProductionDependencies();
    container.register("TransactionUseCase", { useValue: mockTransactionUseCase });
    container.register("CommunityUseCase", { useValue: mockCommunityUseCase });
    container.register("MembershipUseCase", { useValue: mockMembershipUseCase });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const runTest = (
    name: string,
    query: string,
    vars: Record<string, unknown>,
    useCaseFn: jest.Mock,
  ) => {
    it.each([
      [Role.OWNER, true],
      [Role.MANAGER, false],
      [Role.MEMBER, false],
      [undefined, false],
    ])(`${name} - role %p should be allowed = %p`, async (role, allowed) => {
      const context = {
        currentUser: role ? { id: "user-1" } : undefined,
        hasPermissions: {
          memberships: role ? [{ communityId: "community-1", role }] : [],
        },
      };

      const app = await createApolloTestServer(context);

      const res = await request(app).post("/graphql").send({ query, variables: vars });
      const error = res.body.errors?.[0];

      console.log("useCaseFn", useCaseFn);
      console.dir(res.body, { depth: null });

      if (allowed) {
        expect(res.body.data).toBeDefined();
        expect(error).toBeUndefined();
        expect(useCaseFn).toHaveBeenCalledTimes(1);
      } else {
        expect(res.body.data).toBeUndefined();
        expect(error?.code || error?.extensions?.code).toBe("FORBIDDEN");
        expect(useCaseFn).toHaveBeenCalledTimes(0);
      }
    });
  };

  runTest(
    "transactionIssueCommunityPoint",
    queries.transactionIssue,
    variables.issue,
    mockTransactionUseCase.ownerIssueCommunityPoint,
  );
  runTest(
    "transactionGrantCommunityPoint",
    queries.transactionGrant,
    variables.grant,
    mockTransactionUseCase.ownerGrantCommunityPoint,
  );
  runTest(
    "communityDelete",
    queries.communityDelete,
    variables.delete,
    mockCommunityUseCase.ownerDeleteCommunity,
  );
  runTest(
    "membershipAssignOwner",
    queries.membershipAssignOwner,
    variables.assignOwner,
    mockMembershipUseCase.ownerAssignOwner,
  );
  runTest(
    "membershipRemove",
    queries.membershipRemove,
    variables.remove,
    mockMembershipUseCase.ownerRemoveMember,
  );
});
