/**
 * `UserDidUseCase` — transaction boundary for the User DID lifecycle.
 *
 * Phase 1 step 8 scope:
 *   - Adds GraphQL-facing entries (`viewUserDid`, `createUserDidForUser`,
 *     `deactivateUserDidForUser`) that produce `GqlUserDidAnchor` via the
 *     presenter.
 *   - Keeps the existing service-level wrappers used by other Phase 1
 *     surfaces (HTTP route, anchor batch).
 *
 * Per CLAUDE.md "Layer Responsibilities" the usecase is the only layer
 * that may open a transaction; the service stays unaware of
 * `ctx.issuer.public`.
 *
 * Authorization (review feedback) ----------------------------------------
 *
 * The schema's `@authz` directives gate by "is the caller authenticated"
 * (`IsUser`) and "does `permission.userId` match `currentUser.id`"
 * (`IsSelf`), but neither one binds `input.userId` (or `args.userId`) to
 * the caller. We therefore enforce that binding here in the usecase:
 *
 *   - reads (`viewUserDid`)            — caller must be the target user
 *                                         OR an admin; otherwise return
 *                                         `null` so the DID is hidden.
 *   - writes (`createUserDidForUser`,
 *             `deactivateUserDidForUser`) — `userId` must equal
 *                                         `currentUser.id`; otherwise
 *                                         throw `AuthorizationError`.
 *
 * The did:web Document is published over the public REST endpoint
 * (`/users/:userId/did.json`), so this restriction does not weaken the
 * resolver-side privacy story — it only keeps the GraphQL surface
 * consistent with the rest of the API (self + admin).
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.1
 *   docs/report/did-vc-internalization.md §B (single-issuer / no User key)
 *   CLAUDE.md "Transaction Handling Pattern"
 */

import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { AuthorizationError } from "@/errors/graphql";
import UserDidService from "@/application/domain/account/userDid/service";
import UserDidPresenter from "@/application/domain/account/userDid/presenter";
import VcIssuanceService from "@/application/domain/credential/vcIssuance/service";
import logger from "@/infrastructure/logging";
import type { Prisma } from "@prisma/client";
import type {
  AnchorNetworkValue,
  UserDidAnchorRow,
} from "@/application/domain/account/userDid/data/type";
import type { GqlChainNetwork, GqlUserDidAnchor } from "@/types/graphql";

/**
 * True when the caller is the target user, or when the caller is an
 * admin. Centralised so the read / write paths share one definition of
 * "may act on this `userId`". Returns `false` for anonymous callers
 * (defence-in-depth — the schema already gates on `IsUser` / `IsSelf`).
 */
function isSelfOrAdmin(ctx: IContext, userId: string): boolean {
  if (ctx.isAdmin) return true;
  return ctx.currentUser?.id === userId;
}

/**
 * Reason string passed to `StatusListService.revokeVc` (via
 * `VcIssuanceService.cascadeRevokeForUser`) for every VC revoked as a
 * side-effect of a DID DEACTIVATE. Persisted to `revocation_reason` so
 * audit log queries can distinguish operator-initiated revocations from
 * the lifecycle cascade (§14.2 / §E).
 */
const DID_DEACTIVATE_REASON = "did-deactivated";

@injectable()
export default class UserDidUseCase {
  constructor(
    @inject("UserDidService") private readonly service: UserDidService,
    @inject("VcIssuanceService") private readonly vcIssuanceService: VcIssuanceService,
  ) {}

  /**
   * §14.2 / §E — cascade-revoke every still-live VC for `userId` inside
   * the supplied transaction. Pulled out so both the GraphQL-facing
   * (`deactivateUserDidForUser`) and service-level (`deactivateDid`)
   * entry points share a single cascade implementation; behavioural
   * drift between the two would let one path leave dangling VCs.
   *
   * Logs a single line with the revoked count so the cascade is visible
   * in audit traces without re-querying the StatusList.
   */
  private async cascadeRevokeUserVcs(
    ctx: IContext,
    userId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const revoked = await this.vcIssuanceService.cascadeRevokeForUser(
      ctx,
      userId,
      tx,
      DID_DEACTIVATE_REASON,
    );
    logger.info("[UserDidUseCase] DID DEACTIVATE → cascade-revoked VCs", {
      userId,
      revokedCount: revoked,
    });
  }

  /**
   * GraphQL `userDid(userId)` resolver entry. Reads outside a write
   * transaction; `ctx.issuer.public` is used so RLS still applies.
   *
   * Returns `null` (instead of throwing) when the caller asks about
   * someone else's DID. The did:web Document is public via REST, but the
   * GraphQL surface is intentionally narrower (self + admin) so a
   * `userDid` query cannot be used to enumerate which civicship users
   * have an anchor on chain.
   */
  async viewUserDid(ctx: IContext, userId: string): Promise<GqlUserDidAnchor | null> {
    if (!isSelfOrAdmin(ctx, userId)) {
      return null;
    }
    const row = await ctx.issuer.public(ctx, async () => {
      return this.service.findLatestForUser(ctx, userId);
    });
    return row ? UserDidPresenter.view(row) : null;
  }

  /**
   * GraphQL `createUserDid(input)` resolver entry. Opens an
   * issuer-scoped transaction and enqueues a CREATE-op anchor.
   *
   * `ctx.issuer.public` is used (rather than `onlyBelongingCommunity`)
   * because user DID lifecycle is keyed by `userId` and not gated on
   * community membership — the resolver performs its own auth check via
   * `@authz(rules: [IsSelf])`. We additionally assert that
   * `input.userId === currentUser.id` so a caller cannot pass
   * `permission.userId === currentUser.id` while targeting a different
   * `input.userId` (the `IsSelf` rule only binds `permission`).
   */
  async createUserDidForUser(
    ctx: IContext,
    userId: string,
    network?: GqlChainNetwork,
  ): Promise<GqlUserDidAnchor> {
    if (!isSelfOrAdmin(ctx, userId)) {
      throw new AuthorizationError("input.userId must match the authenticated user");
    }
    const row = await ctx.issuer.public(ctx, async (tx) => {
      return this.service.createDidForUser(ctx, userId, tx, network as AnchorNetworkValue);
    });
    return UserDidPresenter.view(row);
  }

  /**
   * GraphQL `deactivateUserDid(userId)` resolver entry. Opens an
   * issuer-scoped transaction and enqueues a DEACTIVATE-op anchor.
   *
   * Same `userId === currentUser.id` assertion as `createUserDidForUser`
   * — see that method for rationale.
   */
  async deactivateUserDidForUser(ctx: IContext, userId: string): Promise<GqlUserDidAnchor> {
    if (!isSelfOrAdmin(ctx, userId)) {
      throw new AuthorizationError("userId must match the authenticated user");
    }
    // §14.2 — DID DEACTIVATE + VC cascade revoke commit in the SAME
    // transaction. Splitting them would create a "DID is tombstoned but
    // a freshly-fetched VC still verifies as live" window that the
    // design's acceptance check (line 2123) explicitly forbids.
    const row = await ctx.issuer.public(ctx, async (tx) => {
      const anchor = await this.service.deactivateDid(ctx, userId, tx);
      await this.cascadeRevokeUserVcs(ctx, userId, tx);
      return anchor;
    });
    return UserDidPresenter.view(row);
  }

  // -----------------------------------------------------------------------
  // Service-level wrappers preserved for other Phase 1 surfaces.
  // -----------------------------------------------------------------------

  async createDidForUser(ctx: IContext, userId: string): Promise<UserDidAnchorRow> {
    return ctx.issuer.public(ctx, async (tx) => {
      return this.service.createDidForUser(ctx, userId, tx);
    });
  }

  async updateDid(ctx: IContext, userId: string): Promise<UserDidAnchorRow> {
    return ctx.issuer.public(ctx, async (tx) => {
      return this.service.updateDid(ctx, userId, tx);
    });
  }

  async deactivateDid(ctx: IContext, userId: string): Promise<UserDidAnchorRow> {
    // §14.2 — same cascade as `deactivateUserDidForUser` so non-GraphQL
    // callers (admin tooling, batch hooks) cannot bypass the VC revoke
    // step by reaching for the service-level wrapper.
    return ctx.issuer.public(ctx, async (tx) => {
      const anchor = await this.service.deactivateDid(ctx, userId, tx);
      await this.cascadeRevokeUserVcs(ctx, userId, tx);
      return anchor;
    });
  }
}
