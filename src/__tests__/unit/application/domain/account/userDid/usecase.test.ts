/**
 * Unit tests for `UserDidUseCase` authorization (review feedback for
 * PR #1101).
 *
 * The schema's `@authz` rules only check "is the caller authenticated"
 * (`IsUser`) and "does `permission.userId` match `currentUser.id`"
 * (`IsSelf`); they do **not** bind `input.userId` (or `args.userId`) to
 * the caller. The usecase therefore enforces an additional
 * "self-or-admin" assertion. These tests exercise that boundary
 * directly: the service is mocked so we can assert whether the call
 * proceeded or was short-circuited / thrown.
 */

import "reflect-metadata";
import { container } from "tsyringe";
import UserDidUseCase from "@/application/domain/account/userDid/usecase";
import UserDidService from "@/application/domain/account/userDid/service";
import { AuthorizationError } from "@/errors/graphql";
import type { IContext } from "@/types/server";

const SELF_USER_ID = "user-self";
const OTHER_USER_ID = "user-other";

function makeIssuer() {
  // The usecase only calls `ctx.issuer.public(ctx, cb)`. The fake forwards
  // to the callback with a sentinel "tx" so the service mock can ignore
  // it — we are not exercising Prisma here.
  return {
    public: jest.fn().mockImplementation(async (_ctx: IContext, cb: (tx: unknown) => unknown) =>
      cb({ sentinel: "tx" }),
    ),
  };
}

function makeCtx(overrides: Partial<IContext> = {}): IContext {
  return {
    issuer: makeIssuer(),
    loaders: {} as never,
    communityId: "community-1",
    currentUser: { id: SELF_USER_ID } as never,
    isAdmin: false,
    ...overrides,
  } as IContext;
}

describe("UserDidUseCase (authz hardening for PR #1101)", () => {
  let mockService: jest.Mocked<Pick<UserDidService, "findLatestForUser" | "createDidForUser" | "deactivateDid">>;
  let usecase: UserDidUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockService = {
      findLatestForUser: jest.fn(),
      createDidForUser: jest.fn(),
      deactivateDid: jest.fn(),
    };

    container.register("UserDidService", { useValue: mockService });
    container.register("UserDidUseCase", { useClass: UserDidUseCase });

    usecase = container.resolve(UserDidUseCase);
  });

  describe("viewUserDid (other-user guard — Major #1)", () => {
    it("returns null without hitting the service when querying another user's DID", async () => {
      const ctx = makeCtx();

      const result = await usecase.viewUserDid(ctx, OTHER_USER_ID);

      expect(result).toBeNull();
      expect(mockService.findLatestForUser).not.toHaveBeenCalled();
    });

    it("loads the row when the caller is the target user", async () => {
      mockService.findLatestForUser.mockResolvedValueOnce(null);
      const ctx = makeCtx();

      await usecase.viewUserDid(ctx, SELF_USER_ID);

      expect(mockService.findLatestForUser).toHaveBeenCalledWith(ctx, SELF_USER_ID);
    });

    it("admins can read any user's DID", async () => {
      mockService.findLatestForUser.mockResolvedValueOnce(null);
      const ctx = makeCtx({ isAdmin: true, currentUser: { id: "admin-1" } as never });

      await usecase.viewUserDid(ctx, OTHER_USER_ID);

      expect(mockService.findLatestForUser).toHaveBeenCalledWith(ctx, OTHER_USER_ID);
    });
  });

  describe("createUserDidForUser (input.userId binding — Major #2)", () => {
    it("throws AuthorizationError when input.userId !== currentUser.id", async () => {
      const ctx = makeCtx();

      await expect(usecase.createUserDidForUser(ctx, OTHER_USER_ID)).rejects.toBeInstanceOf(
        AuthorizationError,
      );
      expect(mockService.createDidForUser).not.toHaveBeenCalled();
    });

    it("invokes the service when input.userId === currentUser.id", async () => {
      mockService.createDidForUser.mockResolvedValueOnce({
        id: "anchor-1",
        userId: SELF_USER_ID,
        did: `did:web:api.civicship.app:users:${SELF_USER_ID}`,
        operation: "CREATE",
        documentHash: "0".repeat(64),
        documentCbor: new Uint8Array(),
        network: "CARDANO_MAINNET",
        chainTxHash: null,
        chainOpIndex: null,
        status: "PENDING",
        confirmedAt: null,
        createdAt: new Date(),
      } as never);
      const ctx = makeCtx();

      await usecase.createUserDidForUser(ctx, SELF_USER_ID);

      expect(mockService.createDidForUser).toHaveBeenCalledTimes(1);
    });
  });

  describe("deactivateUserDidForUser (userId binding)", () => {
    it("throws AuthorizationError when userId !== currentUser.id", async () => {
      const ctx = makeCtx();

      await expect(usecase.deactivateUserDidForUser(ctx, OTHER_USER_ID)).rejects.toBeInstanceOf(
        AuthorizationError,
      );
      expect(mockService.deactivateDid).not.toHaveBeenCalled();
    });
  });
});
