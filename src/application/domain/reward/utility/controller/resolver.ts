import {
  GqlQueryUtilitiesArgs,
  GqlQueryUtilityArgs,
  GqlMutationUtilityCreateArgs,
  GqlMutationUtilityDeleteArgs,
  GqlMutationUtilityUpdateInfoArgs,
  GqlUtility,
  GqlUtilityTicketsArgs,
  GqlUtilityRequiredForOpportunitiesArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import UtilityUseCase from "@/application/domain/reward/utility/usecase";
import TicketUseCase from "@/application/domain/reward/ticket/usecase";
import OpportunityUseCase from "@/application/domain/experience/opportunity/usecase";

@injectable()
export default class UtilityResolver {
  constructor(
    @inject("UtilityUseCase") private readonly utilityUseCase: UtilityUseCase,
    @inject("TicketUseCase") private readonly ticketUseCase: TicketUseCase,
    @inject("OpportunityUseCase") private readonly opportunityUseCase: OpportunityUseCase,
  ) {}

  Query = {
    utilities: (_: unknown, args: GqlQueryUtilitiesArgs, ctx: IContext) => {
      return this.utilityUseCase.anyoneBrowseUtilities(ctx, args);
    },

    utility: (_: unknown, args: GqlQueryUtilityArgs, ctx: IContext) => {
      if (!ctx.loaders?.utility) {
        return this.utilityUseCase.visitorViewUtility(ctx, args);
      }
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
    tickets: (parent: GqlUtility, args: GqlUtilityTicketsArgs, ctx: IContext) => {
      return this.ticketUseCase.visitorBrowseTickets(ctx, {
        ...args,
        filter: { ...args.filter, utilityId: parent.id },
      });
    },

    requiredForOpportunities: (
      parent: GqlUtility,
      args: GqlUtilityRequiredForOpportunitiesArgs,
      ctx: IContext,
    ) => {
      return this.opportunityUseCase.anyoneBrowseOpportunities(
        {
          ...args,
          filter: { ...args.filter, requiredUtilityIds: [parent.id] },
        },
        ctx,
      );
    },
  };
}
