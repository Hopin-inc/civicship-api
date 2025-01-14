import {
  GqlMutationParticipationSetApplyArgs,
  GqlMutationParticipationSetApproveArgs,
  GqlMutationParticipationSetCancelArgs,
  GqlMutationParticipationSetDenyArgs,
  GqlMutationParticipationSetNotParticipatingArgs,
  GqlMutationParticipationSetParticipatingArgs,
  GqlQueryParticipationArgs,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationUseCase from "@/domains/opportunity/subdomains/paricipation/usecase";

const participationResolver = {
  Query: {
    participations: async (_: unknown, args: GqlQueryParticipationsArgs, ctx: IContext) =>
      ParticipationUseCase.visitorBrowseParticipations(args, ctx),
    participation: async (_: unknown, args: GqlQueryParticipationArgs, ctx: IContext) =>
      ParticipationUseCase.visitorViewParticipation(args, ctx),
  },
  Mutation: {
    participationSetApply: async (
      _: unknown,
      args: GqlMutationParticipationSetApplyArgs,
      ctx: IContext,
    ) => ParticipationUseCase.userApplyForOpportunity(args, ctx),
    participationSetCancel: async (
      _: unknown,
      args: GqlMutationParticipationSetCancelArgs,
      ctx: IContext,
    ) => ParticipationUseCase.userCancelParticipation(args, ctx),
    participationSetParticipating: async (
      _: unknown,
      args: GqlMutationParticipationSetParticipatingArgs,
      ctx: IContext,
    ) => ParticipationUseCase.managerApproveApplication(args, ctx),
    participationSetNotParticipating: async (
      _: unknown,
      args: GqlMutationParticipationSetNotParticipatingArgs,
      ctx: IContext,
    ) => ParticipationUseCase.managerDenyApplication(args, ctx),
    participationSetApprove: async (
      _: unknown,
      args: GqlMutationParticipationSetApproveArgs,
      ctx: IContext,
    ) => ParticipationUseCase.managerApprovePerformance(args, ctx),
    participationSetDeny: async (
      _: unknown,
      args: GqlMutationParticipationSetDenyArgs,
      ctx: IContext,
    ) => ParticipationUseCase.managerDenyPerformance(args, ctx),
  },
};

export default participationResolver;
