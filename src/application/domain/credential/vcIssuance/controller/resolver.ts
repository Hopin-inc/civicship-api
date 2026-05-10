/**
 * `VcIssuanceResolver` — GraphQL Query / Mutation entry points for the
 * `VcIssuance` type (§5.2.2 / Phase 1 step 8).
 *
 * Per CLAUDE.md "Layer Responsibilities", the resolver delegates to the
 * usecase layer immediately and contains no business logic. Authorization
 * is enforced by `@authz` directives in the schema files (`IsUser` for
 * the reads, `IsAdmin` for the issue mutation).
 *
 * Phase 1.5 addition: field resolvers for `VcIssuance.user` and
 * `VcIssuance.evaluation` — both resolve via per-request DataLoaders
 * registered as `ctx.loaders.userByVcIssuance` and
 * `ctx.loaders.evaluationByVcIssuance`. `userId` is always present on
 * the parent (`ID!`) while `evaluationId` is optional, so the
 * evaluation resolver short-circuits to `null` rather than handing the
 * loader an undefined key.
 */

import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import VcIssuanceUseCase from "@/application/domain/credential/vcIssuance/usecase";
import type {
  GqlMutationIssueVcArgs,
  GqlQueryVcIssuanceArgs,
  GqlQueryVcIssuancesByUserArgs,
  GqlVcIssuance,
} from "@/types/graphql";

@injectable()
export default class VcIssuanceResolver {
  constructor(@inject("VcIssuanceUseCase") private readonly vcIssuanceUseCase: VcIssuanceUseCase) {}

  Query = {
    vcIssuance: (_: unknown, args: GqlQueryVcIssuanceArgs, ctx: IContext) => {
      return this.vcIssuanceUseCase.viewVcIssuance(ctx, args.id);
    },
    vcIssuancesByUser: (_: unknown, args: GqlQueryVcIssuancesByUserArgs, ctx: IContext) => {
      return this.vcIssuanceUseCase.viewVcIssuancesByUser(ctx, args.userId);
    },
  };

  Mutation = {
    issueVc: (_: unknown, args: GqlMutationIssueVcArgs, ctx: IContext) => {
      return this.vcIssuanceUseCase.issueVc(ctx, args.input);
    },
  };

  VcIssuance = {
    user: (parent: GqlVcIssuance, _: unknown, ctx: IContext) => {
      return ctx.loaders.userByVcIssuance.load(parent.userId);
    },
    evaluation: (parent: GqlVcIssuance, _: unknown, ctx: IContext) => {
      return parent.evaluationId
        ? ctx.loaders.evaluationByVcIssuance.load(parent.evaluationId)
        : null;
    },
  };
}
