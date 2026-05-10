/**
 * `UserDidResolver` — GraphQL Query / Mutation entry points for the
 * `UserDidAnchor` type (§5.2.1 / Phase 1 step 8).
 *
 * Per CLAUDE.md "Layer Responsibilities", the resolver delegates to the
 * usecase layer immediately and contains no business logic. Authorization
 * is enforced by `@authz` directives in the schema files (`IsUser` for
 * the read, `IsSelf` for the writes).
 *
 * Phase 1.5 addition: `UserDidAnchor.user` field resolver — resolves
 * the anchor's owning user via the per-request DataLoader registered as
 * `ctx.loaders.userByUserDidAnchor`. The `userId` foreign key is carried
 * onto the resolver result by `UserDidPresenter.view`, so the field
 * resolver only needs to read `parent.userId` (no additional DB hop).
 */

import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import UserDidUseCase from "@/application/domain/account/userDid/usecase";
import type {
  GqlMutationCreateUserDidArgs,
  GqlMutationDeactivateUserDidArgs,
  GqlQueryUserDidArgs,
  GqlUserDidAnchor,
} from "@/types/graphql";

/**
 * Resolver-result shape: GraphQL `UserDidAnchor` plus the `userId`
 * foreign key carried by `UserDidPresenter.view`. Declared locally so
 * the field resolver can read `parent.userId` without casting.
 */
type UserDidAnchorParent = GqlUserDidAnchor & { userId: string };

@injectable()
export default class UserDidResolver {
  constructor(@inject("UserDidUseCase") private readonly userDidUseCase: UserDidUseCase) {}

  Query = {
    userDid: (_: unknown, args: GqlQueryUserDidArgs, ctx: IContext) => {
      return this.userDidUseCase.viewUserDid(ctx, args.userId);
    },
  };

  Mutation = {
    createUserDid: (_: unknown, args: GqlMutationCreateUserDidArgs, ctx: IContext) => {
      return this.userDidUseCase.createUserDidForUser(
        ctx,
        args.input.userId,
        args.input.network ?? undefined,
      );
    },
    deactivateUserDid: (_: unknown, args: GqlMutationDeactivateUserDidArgs, ctx: IContext) => {
      return this.userDidUseCase.deactivateUserDidForUser(ctx, args.userId);
    },
  };

  UserDidAnchor = {
    user: (parent: UserDidAnchorParent, _: unknown, ctx: IContext) => {
      return ctx.loaders.userByUserDidAnchor.load(parent.userId);
    },
  };
}
