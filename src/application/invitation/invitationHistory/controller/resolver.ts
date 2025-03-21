import {
  GqlQueryOpportunityInvitationHistoriesArgs,
  GqlQueryOpportunityInvitationHistoryArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityInvitationHistoryUseCase from "@/application/invitation/invitationHistory/usecase";

const invitationHistoryResolver = {
  Query: {
    opportunityInvitationHistories: async (
      _: unknown,
      args: GqlQueryOpportunityInvitationHistoriesArgs,
      ctx: IContext,
    ) => {
      return OpportunityInvitationHistoryUseCase.visitorBrowseOpportunityInvitationHistories(
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
        return OpportunityInvitationHistoryUseCase.visitorViewOpportunityInvitationHistory(
          args,
          ctx,
        );
      }
      return ctx.loaders.opportunityInvitationHistory.load(args.id);
    },
  },
};

export default invitationHistoryResolver;
