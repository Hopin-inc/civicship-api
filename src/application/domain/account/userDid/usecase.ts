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
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.1
 *   CLAUDE.md "Transaction Handling Pattern"
 */

import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import UserDidService from "@/application/domain/account/userDid/service";
import UserDidPresenter from "@/application/domain/account/userDid/presenter";
import type {
  AnchorNetworkValue,
  UserDidAnchorRow,
} from "@/application/domain/account/userDid/data/type";
import type { GqlChainNetwork, GqlUserDidAnchor } from "@/types/graphql";

@injectable()
export default class UserDidUseCase {
  constructor(@inject("UserDidService") private readonly service: UserDidService) {}

  /**
   * GraphQL `userDid(userId)` resolver entry. Reads outside a write
   * transaction; `ctx.issuer.public` is used so RLS still applies.
   */
  async viewUserDid(ctx: IContext, userId: string): Promise<GqlUserDidAnchor | null> {
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
   * `@authz(rules: [IsSelf])`.
   */
  async createUserDidForUser(
    ctx: IContext,
    userId: string,
    network?: GqlChainNetwork,
  ): Promise<GqlUserDidAnchor> {
    const row = await ctx.issuer.public(ctx, async (tx) => {
      return this.service.createDidForUser(ctx, userId, tx, network as AnchorNetworkValue);
    });
    return UserDidPresenter.view(row);
  }

  /**
   * GraphQL `deactivateUserDid(userId)` resolver entry. Opens an
   * issuer-scoped transaction and enqueues a DEACTIVATE-op anchor.
   */
  async deactivateUserDidForUser(ctx: IContext, userId: string): Promise<GqlUserDidAnchor> {
    const row = await ctx.issuer.public(ctx, async (tx) => {
      return this.service.deactivateDid(ctx, userId, tx);
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
    return ctx.issuer.public(ctx, async (tx) => {
      return this.service.deactivateDid(ctx, userId, tx);
    });
  }
}
