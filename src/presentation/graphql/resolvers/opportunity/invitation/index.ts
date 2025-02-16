import {
  GqlQueryOpportunityInvitationsArgs,
  GqlQueryOpportunityInvitationArgs,
  GqlMutationOpportunityInvitationCreateArgs,
  GqlMutationOpportunityInvitationDisableArgs,
  GqlMutationOpportunityInvitationDeleteArgs,
  GqlOpportunityInvitation,
  GqlOpportunityInvitationHistoriesArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityInvitationUseCase from "@/app/opportunity/invitation/usecase";
import OpportunityInvitationHistoryUseCase from "@/app/opportunity/invitation/history/usecase";

const OpportunityInvitationResolver = {
  Query: {
    opportunityInvitations: async (
      _: unknown,
      args: GqlQueryOpportunityInvitationsArgs,
      ctx: IContext,
    ) => {
      return OpportunityInvitationUseCase.visitorBrowseOpportunityInvitations(args, ctx);
    },
    opportunityInvitation: async (
      _: unknown,
      args: GqlQueryOpportunityInvitationArgs,
      ctx: IContext,
    ) => {
      if (!ctx.loaders?.opportunityInvitation) {
        return OpportunityInvitationUseCase.visitorViewOpportunityInvitation(args, ctx);
      }
      return ctx.loaders.opportunityInvitation.load(args.id);
    },
  },

  Mutation: {
    opportunityInvitationCreate: async (
      _: unknown,
      args: GqlMutationOpportunityInvitationCreateArgs,
      ctx: IContext,
    ) => {
      return OpportunityInvitationUseCase.memberCreateOpportunityInvitation(args, ctx);
    },
    opportunityInvitationDisable: async (
      _: unknown,
      args: GqlMutationOpportunityInvitationDisableArgs,
      ctx: IContext,
    ) => {
      return OpportunityInvitationUseCase.memberDisableOpportunityInvitation(args, ctx);
    },
    opportunityInvitationDelete: async (
      _: unknown,
      args: GqlMutationOpportunityInvitationDeleteArgs,
      ctx: IContext,
    ) => {
      return OpportunityInvitationUseCase.memberDeleteOpportunityInvitation(args, ctx);
    },
  },

  OpportunityInvitation: {
    histories: async (
      parent: GqlOpportunityInvitation,
      args: GqlOpportunityInvitationHistoriesArgs,
      ctx: IContext,
    ) => {
      return OpportunityInvitationHistoryUseCase.visitorBrowseInvitationHistories(
        parent,
        args,
        ctx,
      );
    },
  },
};

export default OpportunityInvitationResolver;
