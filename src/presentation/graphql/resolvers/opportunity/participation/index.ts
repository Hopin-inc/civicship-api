import {
  GqlMutationParticipationAcceptApplicationArgs,
  GqlMutationParticipationAcceptMyInvitationArgs,
  GqlMutationParticipationApplyArgs,
  GqlMutationParticipationApprovePerformanceArgs,
  GqlMutationParticipationCancelInvitationArgs,
  GqlMutationParticipationCancelMyApplicationArgs,
  GqlMutationParticipationDenyApplicationArgs,
  GqlMutationParticipationDenyMyInvitationArgs,
  GqlMutationParticipationDenyPerformanceArgs,
  GqlMutationParticipationInviteArgs,
  GqlParticipation,
  GqlParticipationStatusHistoriesArgs,
  GqlParticipationTransactionsArgs,
  GqlQueryParticipationArgs,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationUseCase from "@/application/opportunity/participation/usecase";
import ParticipationStatusHistoryUseCase from "@/application/opportunity/participation/statusHistory/usecase";
import TransactionUseCase from "@/application/transaction/usecase";

const participationResolver = {
  Query: {
    participations: async (_: unknown, args: GqlQueryParticipationsArgs, ctx: IContext) =>
      ParticipationUseCase.visitorBrowseParticipations(args, ctx),

    participation: async (_: unknown, args: GqlQueryParticipationArgs, ctx: IContext) => {
      if (!ctx.loaders?.participation) {
        return ParticipationUseCase.visitorViewParticipation(args, ctx);
      }
      return await ctx.loaders.participation.load(args.id);
    },
  },
  Mutation: {
    participationInvite: async (
      _: unknown,
      args: GqlMutationParticipationInviteArgs,
      ctx: IContext,
    ) => ParticipationUseCase.memberInviteUserToOpportunity(args, ctx),

    participationCancelInvitation: async (
      _: unknown,
      args: GqlMutationParticipationCancelInvitationArgs,
      ctx: IContext,
    ) => ParticipationUseCase.memberCancelInvitation(args, ctx),

    participationAcceptMyInvitation: async (
      _: unknown,
      args: GqlMutationParticipationAcceptMyInvitationArgs,
      ctx: IContext,
    ) => ParticipationUseCase.userAcceptMyInvitation(args, ctx),

    participationDenyMyInvitation: async (
      _: unknown,
      args: GqlMutationParticipationDenyMyInvitationArgs,
      ctx: IContext,
    ) => ParticipationUseCase.userDenyMyInvitation(args, ctx),

    participationApply: async (
      _: unknown,
      args: GqlMutationParticipationApplyArgs,
      ctx: IContext,
    ) => ParticipationUseCase.userApplyForOpportunity(args, ctx),

    participationCancelMyApplication: async (
      _: unknown,
      args: GqlMutationParticipationCancelMyApplicationArgs,
      ctx: IContext,
    ) => ParticipationUseCase.userCancelMyApplication(args, ctx),

    participationAcceptApplication: async (
      _: unknown,
      args: GqlMutationParticipationAcceptApplicationArgs,
      ctx: IContext,
    ) => ParticipationUseCase.managerAcceptApplication(args, ctx),

    participationDenyApplication: async (
      _: unknown,
      args: GqlMutationParticipationDenyApplicationArgs,
      ctx: IContext,
    ) => ParticipationUseCase.managerDenyApplication(args, ctx),

    participationApprovePerformance: async (
      _: unknown,
      args: GqlMutationParticipationApprovePerformanceArgs,
      ctx: IContext,
    ) => ParticipationUseCase.managerApprovePerformance(args, ctx),

    participationDenyPerformance: async (
      _: unknown,
      args: GqlMutationParticipationDenyPerformanceArgs,
      ctx: IContext,
    ) => ParticipationUseCase.managerDenyPerformance(args, ctx),
  },

  Participation: {
    statusHistories: async (
      parent: GqlParticipation,
      args: GqlParticipationStatusHistoriesArgs,
      ctx: IContext,
    ) => {
      return ParticipationStatusHistoryUseCase.visitorBrowseStatusHistoriesByParticipation(
        parent,
        args,
        ctx,
      );
    },

    transactions: async (
      parent: GqlParticipation,
      args: GqlParticipationTransactionsArgs,
      ctx: IContext,
    ) => {
      return TransactionUseCase.visitorBrowseTransactionsByParticipation(parent, args, ctx);
    },
  },
};

export default participationResolver;
