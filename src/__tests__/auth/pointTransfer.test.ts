import { container } from "tsyringe";
import request from "supertest";
import { createApolloTestServer } from "@/__tests__/helper/test-server";
import { Role } from "@prisma/client";
import path from "path";

jest.mock("@/presentation/graphql/schema/esmPath", () => ({
  getESMDirname: jest.fn(() => path.resolve(__dirname, "../../../src/presentation/graphql/schema")),
}));

const query = `
   mutation ($input: TransactionIssueCommunityPointInput!, $permission: CheckCommunityPermissionInput!) {
    transactionIssueCommunityPoint(input: $input, permission: $permission) {
      ... on TransactionIssueCommunityPointSuccess {
        transaction { id }
      }
    }
  }
`;

const variables = {
  input: {
    toWalletId: "wallet-1",
    transferPoints: 10,
  },
  permission: { communityId: "community-1" },
};

const mockTransactionUseCase = {
  ownerIssueCommunityPoint: jest.fn().mockResolvedValue({
    __typename: "TransactionIssueCommunityPointSuccess",
    transaction: { id: "mock-tx" },
  }),
};

describe("Transaction Issue Community Point - AuthZ", () => {
  beforeAll(() => {
    container.reset();
    // registerProductionDependencies();

    container.register("TransactionUseCase", { useValue: mockTransactionUseCase });
  });

  it.each([
    [Role.OWNER, true],
    [Role.MANAGER, false],
    [Role.MEMBER, false],
    [undefined, false],
  ])("role %p should be allowed = %p", async (role, allowed) => {
    const context = {
      currentUser: role ? { id: "user-1" } : undefined,
      hasPermissions: {
        memberships: role ? [{ communityId: "community-1", role }] : [],
      },
    };

    const app = await createApolloTestServer(context);

    const res = await request(app).post("/graphql").send({ query, variables });
    console.log("🔍 GraphQL Response", JSON.stringify(res.body, null, 2));

    const error = res.body.errors?.[0];

    if (allowed) {
      expect(res.body.data?.transactionIssueCommunityPoint).toBeDefined();
      expect(error).toBeUndefined();

      expect(mockTransactionUseCase.ownerIssueCommunityPoint).toHaveBeenCalled();
    } else {
      expect(res.body.data).toBeNull();
      expect(error.extensions.code).toBe("FORBIDDEN");
    }
  });
});
