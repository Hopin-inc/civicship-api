import {
  GqlQueryMembershipsArgs,
  GqlQueryMembershipArgs,
  GqlMutationMembershipInviteArgs,
  GqlMutationMembershipCancelInvitationArgs,
  GqlMutationMembershipWithdrawArgs,
  GqlMutationMembershipAssignOwnerArgs,
  GqlMutationMembershipAssignManagerArgs,
  GqlMutationMembershipRemoveArgs,
  GqlMutationMembershipAssignMemberArgs,
  GqlMutationMembershipDenyMyInvitationArgs,
  GqlMutationMembershipAcceptMyInvitationArgs,
} from "@/types/graphql";
import MembershipUseCase from "@/domains/membership/usecase";
import { IContext } from "@/types/server";

const membershipResolver = {
  Query: {
    memberships: async (_: unknown, args: GqlQueryMembershipsArgs, ctx: IContext) =>
      MembershipUseCase.visitorBrowseMemberships(args, ctx),
    membership: async (_: unknown, args: GqlQueryMembershipArgs, ctx: IContext) =>
      MembershipUseCase.visitorViewMembership(args, ctx),
  },
  Mutation: {
    membershipInvite: async (_: unknown, args: GqlMutationMembershipInviteArgs, ctx: IContext) =>
      MembershipUseCase.ownerInviteMember(args, ctx),
    membershipCancelInvitation: async (
      _: unknown,
      args: GqlMutationMembershipCancelInvitationArgs,
      ctx: IContext,
    ) => MembershipUseCase.ownerCancelInvitation(args, ctx),
    membershipAcceptMyInvitation: async (
      _: unknown,
      args: GqlMutationMembershipAcceptMyInvitationArgs,
      ctx: IContext,
    ) => MembershipUseCase.userAcceptMyInvitation(args, ctx),
    membershipDenyMyInvitation: async (
      _: unknown,
      args: GqlMutationMembershipDenyMyInvitationArgs,
      ctx: IContext,
    ) => MembershipUseCase.userDenyMyInvitation(args, ctx),
    membershipWithdraw: async (
      _: unknown,
      args: GqlMutationMembershipWithdrawArgs,
      ctx: IContext,
    ) => MembershipUseCase.memberWithdrawCommunity(args, ctx),
    membershipAssignOwner: async (
      _: unknown,
      args: GqlMutationMembershipAssignOwnerArgs,
      ctx: IContext,
    ) => MembershipUseCase.ownerAssignOwner(args, ctx),
    membershipAssignManager: async (
      _: unknown,
      args: GqlMutationMembershipAssignManagerArgs,
      ctx: IContext,
    ) => MembershipUseCase.managerAssignManager(args, ctx),
    membershipAssignMember: async (
      _: unknown,
      args: GqlMutationMembershipAssignMemberArgs,
      ctx: IContext,
    ) => MembershipUseCase.managerAssignMember(args, ctx),
    membershipRemove: async (_: unknown, args: GqlMutationMembershipRemoveArgs, ctx: IContext) =>
      MembershipUseCase.ownerRemoveMember(args, ctx),
  },
};

export default membershipResolver;
