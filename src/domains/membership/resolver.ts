import {
  GqlQueryMembershipsArgs,
  GqlQueryMembershipArgs,
  GqlMutationMembershipInviteArgs,
  GqlMutationMembershipCancelInvitationArgs,
  GqlMutationMembershipApproveInvitationArgs,
  GqlMutationMembershipDenyInvitationArgs,
  GqlMutationMembershipSelfJoinArgs,
  GqlMutationMembershipWithdrawArgs,
  GqlMutationMembershipAssignOwnerArgs,
  GqlMutationMembershipAssignManagerArgs,
  GqlMutationMembershipAssignMemberRoleArgs,
  GqlMutationMembershipRemoveArgs,
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
      MembershipUseCase.memberInviteMembership(args, ctx),
    membershipCancelInvitation: async (
      _: unknown,
      args: GqlMutationMembershipCancelInvitationArgs,
      ctx: IContext,
    ) => MembershipUseCase.memberCancelInvitation(args, ctx),
    membershipApproveInvitation: async (
      _: unknown,
      args: GqlMutationMembershipApproveInvitationArgs,
      ctx: IContext,
    ) => MembershipUseCase.userApproveInvitation(args, ctx),
    membershipDenyInvitation: async (
      _: unknown,
      args: GqlMutationMembershipDenyInvitationArgs,
      ctx: IContext,
    ) => MembershipUseCase.userDenyInvitation(args, ctx),
    membershipSelfJoin: async (
      _: unknown,
      args: GqlMutationMembershipSelfJoinArgs,
      ctx: IContext,
    ) => MembershipUseCase.userSelfJoin(args, ctx),
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
    ) => MembershipUseCase.ownerAssignManager(args, ctx),
    membershipAssignMemberRole: async (
      _: unknown,
      args: GqlMutationMembershipAssignMemberRoleArgs,
      ctx: IContext,
    ) => MembershipUseCase.ownerAssignMember(args, ctx),
    membershipRemove: async (_: unknown, args: GqlMutationMembershipRemoveArgs, ctx: IContext) =>
      MembershipUseCase.ownerRemoveMembership(args, ctx),
  },
};

export default membershipResolver;
