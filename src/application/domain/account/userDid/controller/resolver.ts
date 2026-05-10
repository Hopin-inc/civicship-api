/**
 * `UserDidResolver` — GraphQL Query / Mutation entry points for the
 * `UserDidAnchor` type (§5.2.1 / Phase 1 step 8).
 *
 * Per CLAUDE.md "Layer Responsibilities", the resolver delegates to the
 * usecase layer immediately and contains no business logic. Authorization
 * is enforced by `@authz` directives in the schema files (`IsUser` for
 * the read, `IsSelf` for the writes).
 */

import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import UserDidUseCase from "@/application/domain/account/userDid/usecase";
import type {
  GqlMutationCreateUserDidArgs,
  GqlMutationDeactivateUserDidArgs,
  GqlQueryUserDidArgs,
} from "@/types/graphql";

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
}
