/**
 * Unit tests for `VcIssuanceUseCase` authorization (review feedback for
 * PR #1101).
 *
 * The schema gates reads on `IsUser` (logged-in) only, so the usecase
 * layer enforces the "self-or-admin" rule. We also verify that the
 * id-based `viewVcIssuance` query goes through `ctx.issuer.public` even
 * for reads (Minor #5 — RLS consistency).
 */

import "reflect-metadata";
import { container } from "tsyringe";
import VcIssuanceUseCase from "@/application/domain/credential/vcIssuance/usecase";
import VcIssuanceService from "@/application/domain/credential/vcIssuance/service";
import { AuthorizationError } from "@/errors/graphql";
import type { IContext } from "@/types/server";
import type { VcIssuanceRow } from "@/application/domain/credential/vcIssuance/data/type";

const SELF_USER_ID = "user-self";
const OTHER_USER_ID = "user-other";

function makeRow(overrides: Partial<VcIssuanceRow> = {}): VcIssuanceRow {
  return {
    id: "vc-1",
    userId: SELF_USER_ID,
    evaluationId: null,
    issuerDid: "did:web:api.civicship.app",
    subjectDid: `did:web:api.civicship.app:users:${SELF_USER_ID}`,
    vcFormat: "INTERNAL_JWT",
    vcJwt: "h.p.s",
    statusListIndex: null,
    statusListCredential: null,
    vcAnchorId: null,
    anchorLeafIndex: null,
    status: "COMPLETED",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    completedAt: null,
    revokedAt: null,
    ...overrides,
  };
}

function makeIssuer() {
  return {
    public: jest
      .fn()
      .mockImplementation(async (_ctx: IContext, cb: (tx: unknown) => unknown) =>
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

describe("VcIssuanceUseCase (authz hardening for PR #1101)", () => {
  let mockService: jest.Mocked<
    Pick<VcIssuanceService, "findVcById" | "findVcsByUserId" | "issueVc" | "generateInclusionProof">
  >;
  let usecase: VcIssuanceUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockService = {
      findVcById: jest.fn(),
      findVcsByUserId: jest.fn(),
      issueVc: jest.fn(),
      generateInclusionProof: jest.fn(),
    };

    container.register("VcIssuanceService", { useValue: mockService });
    container.register("VcIssuanceUseCase", { useClass: VcIssuanceUseCase });

    usecase = container.resolve(VcIssuanceUseCase);
  });

  describe("viewVcIssuance (ownership check — Major #3)", () => {
    it("returns null when the row is owned by another user", async () => {
      mockService.findVcById.mockResolvedValueOnce(makeRow({ userId: OTHER_USER_ID }));
      const ctx = makeCtx();

      const result = await usecase.viewVcIssuance(ctx, "vc-1");

      expect(result).toBeNull();
    });

    it("returns the presented row when the caller owns it", async () => {
      mockService.findVcById.mockResolvedValueOnce(makeRow({ userId: SELF_USER_ID }));
      const ctx = makeCtx();

      const result = await usecase.viewVcIssuance(ctx, "vc-1");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("vc-1");
    });

    it("admins can read any user's VC", async () => {
      mockService.findVcById.mockResolvedValueOnce(makeRow({ userId: OTHER_USER_ID }));
      const ctx = makeCtx({ isAdmin: true, currentUser: { id: "admin-1" } as never });

      const result = await usecase.viewVcIssuance(ctx, "vc-1");

      expect(result).not.toBeNull();
    });

    it("returns null when no row matches the id", async () => {
      mockService.findVcById.mockResolvedValueOnce(null);
      const ctx = makeCtx();

      const result = await usecase.viewVcIssuance(ctx, "missing");

      expect(result).toBeNull();
    });

    it("wraps the read in ctx.issuer.public for RLS consistency (Minor #5)", async () => {
      mockService.findVcById.mockResolvedValueOnce(null);
      const ctx = makeCtx();

      await usecase.viewVcIssuance(ctx, "vc-1");

      // The fake `public` is invoked exactly once; the row lookup
      // happens inside its callback.
      expect((ctx.issuer.public as jest.Mock).mock.calls).toHaveLength(1);
    });
  });

  describe("viewVcIssuancesByUser (caller binding — Major #4)", () => {
    it("throws AuthorizationError when querying another user", async () => {
      const ctx = makeCtx();

      await expect(usecase.viewVcIssuancesByUser(ctx, OTHER_USER_ID)).rejects.toBeInstanceOf(
        AuthorizationError,
      );
      expect(mockService.findVcsByUserId).not.toHaveBeenCalled();
    });

    it("returns the list when the caller asks about themselves", async () => {
      mockService.findVcsByUserId.mockResolvedValueOnce([makeRow()]);
      const ctx = makeCtx();

      const result = await usecase.viewVcIssuancesByUser(ctx, SELF_USER_ID);

      expect(result).toHaveLength(1);
    });

    it("admins can list any user's VCs", async () => {
      mockService.findVcsByUserId.mockResolvedValueOnce([makeRow({ userId: OTHER_USER_ID })]);
      const ctx = makeCtx({ isAdmin: true, currentUser: { id: "admin-1" } as never });

      const result = await usecase.viewVcIssuancesByUser(ctx, OTHER_USER_ID);

      expect(result).toHaveLength(1);
    });
  });

  describe("getInclusionProof (§5.4.6)", () => {
    it("returns null when the service yields null (PENDING / missing)", async () => {
      mockService.generateInclusionProof.mockResolvedValueOnce(null);
      const ctx = makeCtx();

      const result = await usecase.getInclusionProof(ctx, "vc-x");
      expect(result).toBeNull();
    });

    it("returns the presented proof when the service yields one", async () => {
      const proof = {
        vcId: "vc-1",
        vcJwt: "h.p.s",
        vcAnchorId: "vca-1",
        rootHash: "ab".repeat(32),
        chainTxHash: "cd".repeat(32),
        proofPath: ["ee".repeat(32)],
        leafIndex: 0,
        blockHeight: 999,
      };
      mockService.generateInclusionProof.mockResolvedValueOnce(proof);
      const ctx = makeCtx();

      const result = await usecase.getInclusionProof(ctx, "vc-1");
      expect(result).toEqual(proof);
    });
  });
});
