import {
  GqlMutationParticipationApplyArgs,
  GqlMutationParticipationApproveApplicationArgs,
  GqlMutationParticipationApproveInvitationArgs,
  GqlMutationParticipationApprovePerformanceArgs,
  GqlMutationParticipationCancelApplicationArgs,
  GqlMutationParticipationCancelInvitationArgs,
  GqlMutationParticipationDenyApplicationArgs,
  GqlMutationParticipationDenyInvitationArgs,
  GqlMutationParticipationDenyPerformanceArgs,
  GqlMutationParticipationInviteArgs,
  GqlParticipation,
  GqlParticipationStatusHistoriesArgs,
  GqlParticipationTransactionsArgs,
  GqlQueryParticipationArgs,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationUseCase from "@/domains/opportunity/participation/usecase";
import TransactionUseCase from "@/domains/transaction/usecase";
import ParticipationStatusHistoryUseCase from "@/domains/opportunity/participationStatusHistory/usecase";

const participationResolver = {
  Query: {
    participations: async (_: unknown, args: GqlQueryParticipationsArgs, ctx: IContext) =>
      ParticipationUseCase.visitorBrowseParticipations(args, ctx),

    participation: async (_: unknown, args: GqlQueryParticipationArgs, ctx: IContext) =>
      ParticipationUseCase.visitorViewParticipation(args, ctx),
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

    participationApproveInvitation: async (
      _: unknown,
      args: GqlMutationParticipationApproveInvitationArgs,
      ctx: IContext,
    ) => ParticipationUseCase.userApproveInvitation(args, ctx),

    participationDenyInvitation: async (
      _: unknown,
      args: GqlMutationParticipationDenyInvitationArgs,
      ctx: IContext,
    ) => ParticipationUseCase.userDenyInvitation(args, ctx),

    participationApply: async (
      _: unknown,
      args: GqlMutationParticipationApplyArgs,
      ctx: IContext,
    ) => ParticipationUseCase.userApplyForOpportunity(args, ctx),

    participationCancelApplication: async (
      _: unknown,
      args: GqlMutationParticipationCancelApplicationArgs,
      ctx: IContext,
    ) => ParticipationUseCase.userCancelApplication(args, ctx),

    participationApproveApplication: async (
      _: unknown,
      args: GqlMutationParticipationApproveApplicationArgs,
      ctx: IContext,
    ) => ParticipationUseCase.managerApproveApplication(args, ctx),

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
