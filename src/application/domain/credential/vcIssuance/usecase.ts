/**
 * `VcIssuanceUseCase` — transaction boundary for the VC issuance flow.
 *
 * Phase 1 step 8 scope:
 *   - Adds GraphQL-facing query handlers (`viewVcIssuance` /
 *     `viewVcIssuancesByUser`) that delegate to the service and return
 *     GraphQL types via the presenter.
 *   - Keeps the existing `issueVc` mutation entry that opens a public
 *     transaction.
 *
 * Phase 1.5 scope:
 *   - Adds `revokeUserVc` (`Mutation.revokeUserVc`). Delegates the actual
 *     bit-flip + `revokedAt` update to `StatusListService.revokeVc`, then
 *     re-reads the row through the VC issuance service so the GraphQL
 *     response surfaces the updated `revokedAt`. The two writes commit
 *     inside the same `ctx.issuer.public` transaction so a partial
 *     failure cannot leave the StatusList ahead of the VC row (or vice
 *     versa).
 *
 * Per CLAUDE.md, the usecase is the only layer that may open a
 * transaction; the service stays unaware of `ctx.issuer.public` etc.
 *
 * Authorization (review feedback) ----------------------------------------
 *
 * The schema gates on `IsUser` / `IsAdmin`, but neither rule restricts a
 * read to "the VC's owner". We layer that ownership check here:
 *
 *   - `viewVcIssuance(id)`        — load the row, then return `null` if
 *                                    the caller is neither the owner nor
 *                                    an admin. `null` instead of `403`
 *                                    keeps the surface symmetric with
 *                                    "no such id" so we don't leak
 *                                    existence to outsiders.
 *   - `viewVcIssuancesByUser`     — caller must be the target user OR an
 *                                    admin; otherwise throw
 *                                    `AuthorizationError` (the request
 *                                    explicitly names a different user,
 *                                    so silently returning `[]` would be
 *                                    indistinguishable from "no VCs yet"
 *                                    and confusing for clients).
 *
 * `issueVc` / `revokeUserVc` are already gated on `IsAdmin` at the schema
 * level (§B — civicship is a single-issuer platform), so no further check
 * is needed.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.2
 *   docs/report/did-vc-internalization.md §5.2.4 (StatusList wiring)
 *   docs/report/did-vc-internalization.md §B (single-issuer model)
 *   CLAUDE.md "Transaction Handling Pattern"
 */

import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { AuthorizationError, NotFoundError } from "@/errors/graphql";
import VcIssuanceService from "@/application/domain/credential/vcIssuance/service";
import StatusListService from "@/application/domain/credential/statusList/service";
import VcIssuancePresenter, {
  type InclusionProofResponse,
} from "@/application/domain/credential/vcIssuance/presenter";
import type { IssueVcInput as DomainIssueVcInput } from "@/application/domain/credential/vcIssuance/data/type";
import type {
  GqlIssueVcInput,
  GqlRevokeUserVcInput,
  GqlVcIssuance,
} from "@/types/graphql";

/**
 * True when the caller is the target user, or when the caller is an
 * admin. Mirrors the helper in `userDid/usecase.ts`; kept local instead
 * of cross-importing because a 3-line predicate isn't worth a shared
 * utility module and the two domains may diverge.
 */
function isSelfOrAdmin(ctx: IContext, userId: string): boolean {
  if (ctx.isAdmin) return true;
  return ctx.currentUser?.id === userId;
}

@injectable()
export default class VcIssuanceUseCase {
  constructor(
    @inject("VcIssuanceService") private readonly service: VcIssuanceService,
    @inject("StatusListService") private readonly statusListService: StatusListService,
  ) {}

  /**
   * GraphQL `vcIssuance(id)` resolver entry. Reads outside a write
   * transaction; we still go through `ctx.issuer.public` so RLS is
   * applied consistently with the rest of the codebase. After the row
   * is loaded we enforce ownership: callers who are neither the VC's
   * `userId` nor an admin get `null` — matching the "no such id" path
   * so we don't leak existence.
   */
  async viewVcIssuance(ctx: IContext, id: string): Promise<GqlVcIssuance | null> {
    const row = await ctx.issuer.public(ctx, async () => {
      return this.service.findVcById(ctx, id);
    });
    if (!row) return null;
    if (!isSelfOrAdmin(ctx, row.userId)) {
      return null;
    }
    return VcIssuancePresenter.view(row);
  }

  /**
   * GraphQL `vcIssuancesByUser(userId)` resolver entry. Asserts the
   * caller is the target user or an admin (the schema's `IsUser` rule
   * only checks "logged in", not "is the right user"). Returns an empty
   * array — never null — to match the GraphQL `[VcIssuance!]!` contract.
   */
  async viewVcIssuancesByUser(ctx: IContext, userId: string): Promise<GqlVcIssuance[]> {
    if (!isSelfOrAdmin(ctx, userId)) {
      throw new AuthorizationError("userId must match the authenticated user");
    }
    const rows = await this.service.findVcsByUserId(ctx, userId);
    return rows.map((row) => VcIssuancePresenter.view(row));
  }

  /**
   * Open an issuer-scoped transaction and issue a VC for the supplied
   * claims. The resulting row is `COMPLETED` per §5.2.2 (anchor state is
   * tracked separately on `vcAnchorId`).
   *
   * Accepts the GraphQL input shape directly so the resolver stays
   * transport-thin. The conversion to the service's `IssueVcInput` is a
   * structural projection (only `evaluationId`'s `null → undefined`
   * normalization is needed because the service signature uses optional).
   */
  async issueVc(ctx: IContext, input: GqlIssueVcInput): Promise<GqlVcIssuance> {
    const serviceInput: DomainIssueVcInput = {
      userId: input.userId,
      evaluationId: input.evaluationId ?? undefined,
      subjectDid: input.subjectDid,
      claims: (input.claims ?? {}) as Record<string, unknown>,
    };
    const row = await ctx.issuer.public(ctx, async (tx) => {
      return this.service.issueVc(ctx, serviceInput, tx);
    });
    return VcIssuancePresenter.view(row);
  }

  /**
   * §5.4.6 — Resolve the Merkle inclusion proof for the supplied VC.
   *
   * Public REST endpoint backing this method (`/vc/:vcId/inclusion-proof`)
   * is unauthenticated, so we do not enforce an ownership check here:
   * the proof reveals only the on-chain anchor metadata + the canonical
   * leaf path, both of which are public information once the batch tx
   * is on-chain. The router maps `null` to 404; exceptions to 500.
   *
   * No transaction is opened — every read goes through `issuer.internal`
   * inside the repository (matching the precedent set by
   * `UserDidAnchorRepository.findLatestByUserId` for the sibling
   * `/users/:userId/did.json` route).
   */
  async getInclusionProof(ctx: IContext, vcId: string): Promise<InclusionProofResponse | null> {
    const proof = await this.service.generateInclusionProof(ctx, vcId);
    if (proof === null) return null;
    return VcIssuancePresenter.toInclusionProofResponse(proof);
  }

  /**
   * Phase 1.5 — `Mutation.revokeUserVc` resolver entry. Authorization is
   * gated on `IsAdmin` at the schema level (single-issuer model, §B), so
   * no further self-or-admin check is needed here.
   *
   * Flow:
   *   1. Open an issuer-scoped transaction so the StatusList bitstring
   *      update and the `revokedAt` stamp commit atomically — a partial
   *      failure must never leave the list bit set while the row still
   *      reads as live (or vice versa).
   *   2. Pre-check the row via `findVcById` so a missing id surfaces as
   *      `NotFoundError` *before* StatusListService throws its own less
   *      specific `Error("…not found.")`. This keeps the GraphQL error
   *      shape consistent with the rest of the codebase (`NOT_FOUND`).
   *   3. Idempotency: if the row is already revoked we re-read and return
   *      it without invoking the StatusListService (the bit is already
   *      flipped; touching it again would re-sign the list VC for no
   *      reason). The original `revokedAt` is preserved.
   *   4. Otherwise call `StatusListService.revokeVc` (flips bit + stamps
   *      `revokedAt`) and re-load the row to surface the updated
   *      timestamp through the presenter.
   *
   * `reason` is forwarded to the StatusList service, which currently logs
   * it but does not persist beyond `revocationReason`. The schema PR
   * `schema/phase1.5-revoke-and-index` will extend persistence; no
   * GraphQL change required at that point.
   */
  async revokeUserVc(ctx: IContext, input: GqlRevokeUserVcInput): Promise<GqlVcIssuance> {
    return ctx.issuer.public(ctx, async (tx) => {
      const existing = await this.service.findVcById(ctx, input.vcId, tx);
      if (!existing) {
        throw new NotFoundError("VcIssuance", { id: input.vcId });
      }
      if (existing.revokedAt) {
        return VcIssuancePresenter.view(existing);
      }

      await this.statusListService.revokeVc(
        ctx,
        {
          vcRequestId: input.vcId,
          reason: input.reason ?? undefined,
        },
        tx,
      );

      const refreshed = await this.service.findVcById(ctx, input.vcId, tx);
      if (!refreshed) {
        throw new NotFoundError("VcIssuance", { id: input.vcId });
      }
      return VcIssuancePresenter.view(refreshed);
    });
  }
}
