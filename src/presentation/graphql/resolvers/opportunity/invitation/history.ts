import {
  GqlQueryOpportunityInvitationHistoriesArgs,
  GqlQueryOpportunityInvitationHistoryArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityInvitationHistoryReadUseCase from "@/application/opportunity/invitation/history/usecse/read";

const invitationHistoryResolver = {
  Query: {
    opportunityInvitationHistories: async (
      _: unknown,
      args: GqlQueryOpportunityInvitationHistoriesArgs,
      ctx: IContext,
    ) => {
      return OpportunityInvitationHistoryReadUseCase.visitorBrowseOpportunityInvitationHistories(
        args,
        ctx,
      );
    },

    opportunityInvitationHistory: async (
      _: unknown,
      args: GqlQueryOpportunityInvitationHistoryArgs,
      ctx: IContext,
    ) => {
      if (!ctx.loaders?.opportunityInvitationHistory) {
        return OpportunityInvitationHistoryReadUseCase.visitorViewOpportunityInvitationHistory(
          args,
          ctx,
        );
      }
      return ctx.loaders.opportunityInvitationHistory.load(args.id);
    },
  },
};

export default invitationHistoryResolver;
