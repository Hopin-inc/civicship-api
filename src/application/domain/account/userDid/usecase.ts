/**
 * `UserDidUseCase` — transaction boundary for the User DID lifecycle.
 *
 * Phase 1 step 7 scope (per task brief):
 *   - Provide a transaction boundary so future GraphQL resolvers (Phase 1
 *     step 8) can drop in without re-architecting.
 *   - Delegate to `UserDidService` for all real work — the usecase is
 *     intentionally thin.
 *
 * Why a usecase exists today even though no resolver calls it yet: the
 * project pattern (CLAUDE.md "Layer Responsibilities") makes UseCase the
 * sole layer that may open transactions. Adding it here avoids an awkward
 * later refactor where every test against the resolver would have to be
 * rewritten to thread a transaction.
 *
 * Strategy A note (Phase 1 step 7) ----------------------------------------
 *
 * The repository writes throw `NotImplementedError` until schema PR #1094
 * merges. Calls into this usecase exercise the full flow up to the
 * persistence boundary, which is exactly the contract test surface the
 * upcoming resolver will need.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.1 (this domain)
 *   CLAUDE.md "Transaction Handling Pattern"
 */

import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import UserDidService from "@/application/domain/account/userDid/service";
import type { UserDidAnchorRow } from "@/application/domain/account/userDid/data/type";

@injectable()
export default class UserDidUseCase {
  constructor(@inject("UserDidService") private readonly service: UserDidService) {}

  /**
   * Open an issuer-scoped transaction and enqueue a CREATE-op anchor.
   *
   * `ctx.issuer.public` is used (rather than `onlyBelongingCommunity`)
   * because user DID lifecycle is keyed by `userId` and not gated on
   * community membership — the resolver will perform its own auth check
   * (Phase 1 step 8) via `src/presentation/graphql/rule.ts`.
   */
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
