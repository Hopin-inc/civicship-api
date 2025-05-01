import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { createApolloTestServer } from "@/__tests__/helper/test-server";
import request from "supertest";
import path from "path";

jest.mock("@/presentation/graphql/schema/esmPath", () => ({
  getESMDirname: jest.fn(() => path.resolve(__dirname, "../../../src/presentation/graphql/schema")),
}));

jest.mock("@/application/domain/utils", () => ({
  getCurrentUserId: jest.fn(() => "user-1"),
}));

const queries = {
  userDeleteMe: `
    mutation ($permission: CheckIsSelfPermissionInput!) {
      userDeleteMe(permission: $permission) {
        userId
      }
    }
  `,
  membershipAcceptMyInvitation: `
    mutation ($input: MembershipSetInvitationStatusInput!, $permission: CheckIsSelfPermissionInput!) {
      membershipAcceptMyInvitation(input: $input, permission: $permission) {
        ... on MembershipSetInvitationStatusSuccess {
          membership {
            user { id }
            community { id }
          }
        }
      }
    }
  `,
  membershipDenyMyInvitation: `
    mutation ($input: MembershipSetInvitationStatusInput!, $permission: CheckIsSelfPermissionInput!) {
      membershipDenyMyInvitation(input: $input, permission: $permission) {
        ... on MembershipSetInvitationStatusSuccess {
         membership {
            user { id }
            community { id }
          }
        }
      }
    }
  `,
  membershipWithdraw: `
    mutation ($input: MembershipWithdrawInput!, $permission: CheckIsSelfPermissionInput!) {
      membershipWithdraw(input: $input, permission: $permission) {
        ... on MembershipWithdrawSuccess {
          userId
          communityId
        }
      }
    }
  `,
  reservationCancel: `
    mutation ($id: ID!, $input: ReservationCancelInput!, $permission: CheckIsSelfPermissionInput!) {
      reservationCancel(id: $id, input: $input, permission: $permission) {
        ... on ReservationSetStatusSuccess {
          reservation { id }
        }
      }
    }
  `,
};

const variables = {
  deleteMe: {
    permission: { userId: "user-1" },
  },
  membershipAccept: {
    input: { userId: "user-1", communityId: "community-1" },
    permission: { userId: "user-1" },
  },
  membershipDeny: {
    input: { userId: "user-1", communityId: "community-1" },
    permission: { userId: "user-1" },
  },
  membershipWithdraw: {
    input: { userId: "user-1", communityId: "community-1" },
    permission: { userId: "user-1" },
  },
  reservationCancel: {
    id: "reservation-1",
    input: {
      paymentMethod: "FEE",
      ticketIdsIfExists: [],
    },
    permission: {
      userId: "user-1",
    },
  },
};

const mockIdentityUseCase = {
  userDeleteAccount: jest.fn().mockResolvedValue({
    userId: "user-1",
  }),
};

const mockMembershipUseCase = {
  userAcceptMyInvitation: jest.fn().mockResolvedValue({
    __typename: "MembershipSetInvitationStatusSuccess",
    membership: { user: { id: "user-1" }, community: { id: "community-1" } },
  }),
  userDenyMyInvitation: jest.fn().mockResolvedValue({
    __typename: "MembershipSetInvitationStatusSuccess",
    membership: { user: { id: "user-1" }, community: { id: "community-1" } },
  }),
  memberWithdrawCommunity: jest.fn().mockResolvedValue({
    __typename: "MembershipWithdrawSuccess",
    userId: "user-1",
    communityId: "community-1",
  }),
};

const mockReservationUseCase = {
  userCancelMyReservation: jest.fn().mockResolvedValue({
    __typename: "ReservationSetStatusSuccess",
    reservation: {
      id: "reservation-1",
    },
  }),
};

describe("Self-only mutations - AuthZ", () => {
  beforeAll(() => {
    container.reset();
    registerProductionDependencies();
    container.register("IdentityUseCase", { useValue: mockIdentityUseCase });
    container.register("MembershipUseCase", { useValue: mockMembershipUseCase });
    container.register("ReservationUseCase", { useValue: mockReservationUseCase });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const runTest = (name: string, query: string, vars: any, useCaseFn: jest.Mock) => {
    it.each([
      ["same user", "user-1", true],
      ["different user", "user-2", false],
      ["unauthenticated", undefined, false],
    ])(`${name} - %s should be allowed = %p`, async (_label, currentUserId, allowed) => {
      const context = {
        currentUser: currentUserId ? { id: currentUserId } : undefined,
        hasPermissions: {
          self: [{ userId: "user-1" }],
        },
      };

      const app = await createApolloTestServer(context);

      const res = await request(app).post("/graphql").send({ query, variables: vars });
      const error = res.body.errors?.[0];

      // 🐛 デバッグ出力をここに追加
      console.log(`\n[DEBUG] Test case: ${_label}`);
      console.log(`[DEBUG] currentUserId: ${currentUserId}`);
      console.log("[DEBUG] Request Variables:");
      console.dir(vars ?? { permission: { userId: "user-1" } }, { depth: null });
      console.log("[DEBUG] GraphQL Response:");
      console.dir(res.body, { depth: null });
      console.log("[DEBUG] useCaseFn Call Count:", useCaseFn.mock.calls.length);

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
    "userDeleteMe",
    queries.userDeleteMe,
    variables.deleteMe,
    mockIdentityUseCase.userDeleteAccount,
  );

  runTest(
    "membershipAcceptMyInvitation",
    queries.membershipAcceptMyInvitation,
    variables.membershipAccept,
    mockMembershipUseCase.userAcceptMyInvitation,
  );

  runTest(
    "membershipDenyMyInvitation",
    queries.membershipDenyMyInvitation,
    variables.membershipDeny,
    mockMembershipUseCase.userDenyMyInvitation,
  );

  runTest(
    "membershipWithdraw",
    queries.membershipWithdraw,
    variables.membershipWithdraw,
    mockMembershipUseCase.memberWithdrawCommunity,
  );

  runTest(
    "reservationCancel",
    queries.reservationCancel,
    variables.reservationCancel,
    mockReservationUseCase.userCancelMyReservation,
  );
});
