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
import VcIssuanceService from "@/application/domain/credential/vcIssuance/service";
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
  // Phase 2: the usecase now also depends on VcIssuanceService for the
  // DID DEACTIVATE → cascade-revoke flow (§14.2). Authz tests below
  // don't drive the deactivate path far enough to exercise it, but the
  // container still needs a registration to construct the usecase.
  let mockVcIssuanceService: { cascadeRevokeForUser: jest.Mock };
  let usecase: UserDidUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockService = {
      findLatestForUser: jest.fn(),
      createDidForUser: jest.fn(),
      deactivateDid: jest.fn(),
    };
    mockVcIssuanceService = {
      cascadeRevokeForUser: jest.fn().mockResolvedValue(0),
    };

    container.register("UserDidService", { useValue: mockService });
    container.register("VcIssuanceService", { useValue: mockVcIssuanceService });
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
      // Authz failure must short-circuit before the cascade — otherwise a
      // forbidden caller could still revoke another user's VCs.
      expect(mockVcIssuanceService.cascadeRevokeForUser).not.toHaveBeenCalled();
    });

    it("invokes cascade-revoke after the DID anchor is enqueued (§14.2)", async () => {
      const anchor = {
        id: "anchor-1",
        userId: SELF_USER_ID,
        did: `did:web:api.civicship.app:users:${SELF_USER_ID}`,
        operation: "DEACTIVATE",
        documentHash: "0".repeat(64),
        documentCbor: null,
        network: "CARDANO_MAINNET",
        chainTxHash: null,
        chainOpIndex: null,
        status: "PENDING",
        confirmedAt: null,
        createdAt: new Date(),
      } as never;
      mockService.deactivateDid.mockResolvedValueOnce(anchor);
      mockVcIssuanceService.cascadeRevokeForUser.mockResolvedValueOnce(2);
      const ctx = makeCtx();

      await usecase.deactivateUserDidForUser(ctx, SELF_USER_ID);

      // Both writes commit inside the same `ctx.issuer.public` block — the
      // sentinel tx is forwarded to the cascade so it shares the snapshot.
      expect(mockService.deactivateDid).toHaveBeenCalledWith(
        ctx,
        SELF_USER_ID,
        expect.objectContaining({ sentinel: "tx" }),
      );
      expect(mockVcIssuanceService.cascadeRevokeForUser).toHaveBeenCalledWith(
        ctx,
        SELF_USER_ID,
        expect.objectContaining({ sentinel: "tx" }),
        "did-deactivated",
      );

      // Ordering matters: revoking VCs *before* the DEACTIVATE anchor is
      // enqueued would leave a window where the DID still verifies live
      // but the VCs are already dead. Assert the DEACTIVATE call lands
      // before the cascade.
      const deactivateOrder = mockService.deactivateDid.mock.invocationCallOrder[0];
      const cascadeOrder = mockVcIssuanceService.cascadeRevokeForUser.mock.invocationCallOrder[0];
      expect(deactivateOrder).toBeLessThan(cascadeOrder);
    });

    it("admin path also runs the cascade", async () => {
      mockService.deactivateDid.mockResolvedValueOnce({} as never);
      const ctx = makeCtx({ isAdmin: true, currentUser: { id: "admin-1" } as never });

      await usecase.deactivateUserDidForUser(ctx, OTHER_USER_ID);

      expect(mockVcIssuanceService.cascadeRevokeForUser).toHaveBeenCalledWith(
        ctx,
        OTHER_USER_ID,
        expect.anything(),
        "did-deactivated",
      );
    });
  });

  describe("deactivateDid service-level wrapper", () => {
    it("also runs the cascade so non-GraphQL callers cannot bypass it", async () => {
      mockService.deactivateDid.mockResolvedValueOnce({} as never);
      mockVcIssuanceService.cascadeRevokeForUser.mockResolvedValueOnce(0);
      const ctx = makeCtx();

      await usecase.deactivateDid(ctx, SELF_USER_ID);

      expect(mockVcIssuanceService.cascadeRevokeForUser).toHaveBeenCalledTimes(1);
    });
  });
});
