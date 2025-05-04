import {
  GqlQueryUtilitiesArgs,
  GqlQueryUtilityArgs,
  GqlMutationUtilityCreateArgs,
  GqlMutationUtilityDeleteArgs,
  GqlMutationUtilityUpdateInfoArgs,
} from "@/types/graphql";
import { PrismaUtilityDetail } from "@/application/domain/reward/utility/data/type";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import UtilityUseCase from "@/application/domain/reward/utility/usecase";

@injectable()
export default class UtilityResolver {
  constructor(
    @inject("UtilityUseCase") private readonly utilityUseCase: UtilityUseCase,
  ) {}

  Query = {
    utilities: (_: unknown, args: GqlQueryUtilitiesArgs, ctx: IContext) => {
      return this.utilityUseCase.anyoneBrowseUtilities(ctx, args);
    },

    utility: (_: unknown, args: GqlQueryUtilityArgs, ctx: IContext) => {
      return ctx.loaders.utility.load(args.id);
    },
  };

  Mutation = {
    utilityCreate: (_: unknown, args: GqlMutationUtilityCreateArgs, ctx: IContext) => {
      return this.utilityUseCase.managerCreateUtility(ctx, args);
    },
    utilityDelete: (_: unknown, args: GqlMutationUtilityDeleteArgs, ctx: IContext) => {
      return this.utilityUseCase.managerDeleteUtility(ctx, args);
    },
    utilityUpdateInfo: (_: unknown, args: GqlMutationUtilityUpdateInfoArgs, ctx: IContext) => {
      return this.utilityUseCase.managerUpdateUtilityInfo(ctx, args);
    },
  };

  Utility = {
    community: (parent: PrismaUtilityDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.community.load(parent.communityId);
    },
    
    tickets: (parent: PrismaUtilityDetail, _: unknown, ctx: IContext) => {
      return ctx.issuer.internal(async (tx) => {
        const tickets = await tx.ticket.findMany({
          where: { utilityId: parent.id },
          select: { id: true },
        });
        return ctx.loaders.ticket.loadMany(tickets.map(ticket => ticket.id));
      });
    },

    requiredForOpportunities: (
      parent: PrismaUtilityDetail,
      _: unknown,
      ctx: IContext,
    ) => {
      return ctx.issuer.internal(async (tx) => {
        const opportunities = await tx.opportunity.findMany({
          where: {
            requiredUtilities: {
              some: {
                id: parent.id
              }
            }
          },
          select: { id: true },
        });
        return ctx.loaders.opportunity.loadMany(opportunities.map(opp => opp.id));
      });
    },
  };
}
