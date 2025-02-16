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
import ParticipationReadUseCase from "@/application/opportunity/participation/usecase/read";
import TransactionReadUseCase from "@/application/transaction/usecase/read";
import ParticipationStatusHistoryReadUseCase from "@/application/opportunity/participation/statusHistory/usecase/read";
import ParticipationWriteUseCase from "@/application/opportunity/participation/usecase/write";

const participationResolver = {
  Query: {
    participations: async (_: unknown, args: GqlQueryParticipationsArgs, ctx: IContext) =>
      ParticipationReadUseCase.visitorBrowseParticipations(args, ctx),

    participation: async (_: unknown, args: GqlQueryParticipationArgs, ctx: IContext) => {
      if (!ctx.loaders?.participation) {
        return ParticipationReadUseCase.visitorViewParticipation(args, ctx);
      }
      return await ctx.loaders.participation.load(args.id);
    },
  },
  Mutation: {
    participationInvite: async (
      _: unknown,
      args: GqlMutationParticipationInviteArgs,
      ctx: IContext,
    ) => ParticipationWriteUseCase.memberInviteUserToOpportunity(args, ctx),

    participationCancelInvitation: async (
      _: unknown,
      args: GqlMutationParticipationCancelInvitationArgs,
      ctx: IContext,
    ) => ParticipationWriteUseCase.memberCancelInvitation(args, ctx),

    participationAcceptMyInvitation: async (
      _: unknown,
      args: GqlMutationParticipationAcceptMyInvitationArgs,
      ctx: IContext,
    ) => ParticipationWriteUseCase.userAcceptMyInvitation(args, ctx),

    participationDenyMyInvitation: async (
      _: unknown,
      args: GqlMutationParticipationDenyMyInvitationArgs,
      ctx: IContext,
    ) => ParticipationWriteUseCase.userDenyMyInvitation(args, ctx),

    participationApply: async (
      _: unknown,
      args: GqlMutationParticipationApplyArgs,
      ctx: IContext,
    ) => ParticipationWriteUseCase.userApplyForOpportunity(args, ctx),

    participationCancelMyApplication: async (
      _: unknown,
      args: GqlMutationParticipationCancelMyApplicationArgs,
      ctx: IContext,
    ) => ParticipationWriteUseCase.userCancelMyApplication(args, ctx),

    participationAcceptApplication: async (
      _: unknown,
      args: GqlMutationParticipationAcceptApplicationArgs,
      ctx: IContext,
    ) => ParticipationWriteUseCase.managerAcceptApplication(args, ctx),

    participationDenyApplication: async (
      _: unknown,
      args: GqlMutationParticipationDenyApplicationArgs,
      ctx: IContext,
    ) => ParticipationWriteUseCase.managerDenyApplication(args, ctx),

    participationApprovePerformance: async (
      _: unknown,
      args: GqlMutationParticipationApprovePerformanceArgs,
      ctx: IContext,
    ) => ParticipationWriteUseCase.managerApprovePerformance(args, ctx),

    participationDenyPerformance: async (
      _: unknown,
      args: GqlMutationParticipationDenyPerformanceArgs,
      ctx: IContext,
    ) => ParticipationWriteUseCase.managerDenyPerformance(args, ctx),
  },

  Participation: {
    statusHistories: async (
      parent: GqlParticipation,
      args: GqlParticipationStatusHistoriesArgs,
      ctx: IContext,
    ) => {
      return ParticipationStatusHistoryReadUseCase.visitorBrowseStatusHistoriesByParticipation(
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
      return TransactionReadUseCase.visitorBrowseTransactionsByParticipation(parent, args, ctx);
    },
  },
};

export default participationResolver;
