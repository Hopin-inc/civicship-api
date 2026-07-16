/**
 * Unit tests for `VCIssuanceRequestUseCase` authorization.
 *
 * The `vcIssuanceRequests` / `vcIssuanceRequest` queries previously shipped
 * with NO `@authz` directive and no ownership check, so any caller could
 * enumerate every user's VC issuance requests (broken object-level
 * authorization / IDOR). The schema now gates on `IsUser`; these tests lock
 * in the usecase-layer "self-or-admin" enforcement that binds the request
 * rows to the caller — mirroring the sibling `credential/vcIssuance` usecase.
 */

import "reflect-metadata";
import { container } from "tsyringe";
import VCIssuanceRequestUseCase from "@/application/domain/experience/evaluation/vcIssuanceRequest/usecase";
import { VCIssuanceRequestService } from "@/application/domain/experience/evaluation/vcIssuanceRequest/service";
import { AuthenticationError } from "@/errors/graphql";
import type { IContext } from "@/types/server";
import type { PrismaVCIssuanceRequestDetail } from "@/application/domain/experience/evaluation/vcIssuanceRequest/data/type";

const SELF_USER_ID = "user-self";
const OTHER_USER_ID = "user-other";

function makeRow(
  overrides: Partial<PrismaVCIssuanceRequestDetail> = {},
): PrismaVCIssuanceRequestDetail {
  return {
    id: "vcr-1",
    status: "COMPLETED",
    completedAt: null,
    evaluationId: "eval-1",
    userId: SELF_USER_ID,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  } as PrismaVCIssuanceRequestDetail;
}

function makeCtx(overrides: Partial<IContext> = {}): IContext {
  return {
    issuer: {} as never,
    loaders: {} as never,
    communityId: "community-1",
    currentUser: { id: SELF_USER_ID } as never,
    isAdmin: false,
    ...overrides,
  } as IContext;
}

describe("VCIssuanceRequestUseCase (authz hardening)", () => {
  let mockService: jest.Mocked<
    Pick<VCIssuanceRequestService, "fetchVcIssuanceRequests" | "findVcIssuanceRequest">
  >;
  let usecase: VCIssuanceRequestUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockService = {
      fetchVcIssuanceRequests: jest.fn(),
      findVcIssuanceRequest: jest.fn(),
    };

    container.register("VCIssuanceRequestService", { useValue: mockService });
    container.register("VCIssuanceRequestUseCase", { useClass: VCIssuanceRequestUseCase });

    usecase = container.resolve(VCIssuanceRequestUseCase);
  });

  describe("visitorBrowseVcIssuanceRequests (list scoping)", () => {
    it("forces a non-admin caller's userIds filter to their own id", async () => {
      mockService.fetchVcIssuanceRequests.mockResolvedValueOnce([]);
      const ctx = makeCtx();

      await usecase.visitorBrowseVcIssuanceRequests(ctx, {
        // A malicious client trying to read another user's requests.
        filter: { userIds: [OTHER_USER_ID] },
      });

      expect(mockService.fetchVcIssuanceRequests).toHaveBeenCalledTimes(1);
      const [, args] = mockService.fetchVcIssuanceRequests.mock.calls[0];
      expect(args.filter?.userIds).toEqual([SELF_USER_ID]);
    });

    it("injects the caller's userIds filter even when none was supplied", async () => {
      mockService.fetchVcIssuanceRequests.mockResolvedValueOnce([]);
      const ctx = makeCtx();

      await usecase.visitorBrowseVcIssuanceRequests(ctx, {});

      const [, args] = mockService.fetchVcIssuanceRequests.mock.calls[0];
      expect(args.filter?.userIds).toEqual([SELF_USER_ID]);
    });

    it("leaves the filter untouched for admins (cross-user view)", async () => {
      mockService.fetchVcIssuanceRequests.mockResolvedValueOnce([]);
      const ctx = makeCtx({ isAdmin: true, currentUser: { id: "admin-1" } as never });

      await usecase.visitorBrowseVcIssuanceRequests(ctx, {
        filter: { userIds: [OTHER_USER_ID] },
      });

      const [, args] = mockService.fetchVcIssuanceRequests.mock.calls[0];
      expect(args.filter?.userIds).toEqual([OTHER_USER_ID]);
    });

    it("throws for an anonymous caller (defence-in-depth behind IsUser)", async () => {
      const ctx = makeCtx({ currentUser: undefined, isAdmin: false });

      await expect(usecase.visitorBrowseVcIssuanceRequests(ctx, {})).rejects.toBeInstanceOf(
        AuthenticationError,
      );
      expect(mockService.fetchVcIssuanceRequests).not.toHaveBeenCalled();
    });
  });

  describe("visitorViewVcIssuanceRequest (single ownership check)", () => {
    it("returns null when the request is owned by another user", async () => {
      mockService.findVcIssuanceRequest.mockResolvedValueOnce(makeRow({ userId: OTHER_USER_ID }));
      const ctx = makeCtx();

      const result = await usecase.visitorViewVcIssuanceRequest(ctx, { id: "vcr-1" });

      expect(result).toBeNull();
    });

    it("returns the presented request when the caller owns it", async () => {
      mockService.findVcIssuanceRequest.mockResolvedValueOnce(makeRow({ userId: SELF_USER_ID }));
      const ctx = makeCtx();

      const result = await usecase.visitorViewVcIssuanceRequest(ctx, { id: "vcr-1" });

      expect(result).not.toBeNull();
      expect(result?.id).toBe("vcr-1");
    });

    it("lets admins read any user's request", async () => {
      mockService.findVcIssuanceRequest.mockResolvedValueOnce(makeRow({ userId: OTHER_USER_ID }));
      const ctx = makeCtx({ isAdmin: true, currentUser: { id: "admin-1" } as never });

      const result = await usecase.visitorViewVcIssuanceRequest(ctx, { id: "vcr-1" });

      expect(result).not.toBeNull();
    });

    it("returns null when no request matches the id", async () => {
      mockService.findVcIssuanceRequest.mockResolvedValueOnce(null);
      const ctx = makeCtx();

      const result = await usecase.visitorViewVcIssuanceRequest(ctx, { id: "missing" });

      expect(result).toBeNull();
    });
  });
});
