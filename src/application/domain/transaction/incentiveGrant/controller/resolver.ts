import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import IncentiveGrantUseCase from "../usecase";
import { PrismaIncentiveGrant } from "../data/type";

// Note: GraphQL types will be generated after running `pnpm gql:generate`
// Using 'any' temporarily until types are available
type GqlQueryIncentiveGrantsArgs = any;
type GqlQueryIncentiveGrantArgs = any;

@injectable()
export default class IncentiveGrantResolver {
  constructor(@inject("IncentiveGrantUseCase") private readonly useCase: IncentiveGrantUseCase) {}

  Query = {
    incentiveGrants: async (_: unknown, args: GqlQueryIncentiveGrantsArgs, ctx: IContext) => {
      return this.useCase.visitorBrowseIncentiveGrants(args, ctx);
    },
    incentiveGrant: async (_: unknown, args: GqlQueryIncentiveGrantArgs, ctx: IContext) => {
      return this.useCase.visitorViewIncentiveGrant(args, ctx);
    },
  };

  IncentiveGrant = {
    user: (parent: PrismaIncentiveGrant, _: unknown, ctx: IContext) => {
      return ctx.loaders.user.load(parent.userId);
    },

    community: (parent: PrismaIncentiveGrant, _: unknown, ctx: IContext) => {
      return ctx.loaders.community.load(parent.communityId);
    },

    transaction: (parent: PrismaIncentiveGrant, _: unknown, ctx: IContext) => {
      return parent.transactionId ? ctx.loaders.transaction.load(parent.transactionId) : null;
    },
  };
}
