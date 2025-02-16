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
import OpportunityInvitationReadUseCase from "@/application/opportunity/invitation/usecase/read";
import OpportunityInvitationHistoryReadUseCase from "@/application/opportunity/invitation/history/usecse/read";
import OpportunityInvitationWriteUseCase from "@/application/opportunity/invitation/usecase/write";

const OpportunityInvitationResolver = {
  Query: {
    opportunityInvitations: async (
      _: unknown,
      args: GqlQueryOpportunityInvitationsArgs,
      ctx: IContext,
    ) => {
      return OpportunityInvitationReadUseCase.visitorBrowseOpportunityInvitations(args, ctx);
    },
    opportunityInvitation: async (
      _: unknown,
      args: GqlQueryOpportunityInvitationArgs,
      ctx: IContext,
    ) => {
      if (!ctx.loaders?.opportunityInvitation) {
        return OpportunityInvitationReadUseCase.visitorViewOpportunityInvitation(args, ctx);
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
      return OpportunityInvitationWriteUseCase.managerCreateOpportunityInvitation(args, ctx);
    },
    opportunityInvitationDisable: async (
      _: unknown,
      args: GqlMutationOpportunityInvitationDisableArgs,
      ctx: IContext,
    ) => {
      return OpportunityInvitationWriteUseCase.managerDisableOpportunityInvitation(args, ctx);
    },
    opportunityInvitationDelete: async (
      _: unknown,
      args: GqlMutationOpportunityInvitationDeleteArgs,
      ctx: IContext,
    ) => {
      return OpportunityInvitationWriteUseCase.managerDeleteOpportunityInvitation(args, ctx);
    },
  },

  OpportunityInvitation: {
    histories: async (
      parent: GqlOpportunityInvitation,
      args: GqlOpportunityInvitationHistoriesArgs,
      ctx: IContext,
    ) => {
      return OpportunityInvitationHistoryReadUseCase.visitorBrowseInvitationHistories(
        parent,
        args,
        ctx,
      );
    },
  },
};

export default OpportunityInvitationResolver;
