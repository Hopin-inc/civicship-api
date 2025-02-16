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
import { IContext } from "@/types/server";
import MembershipReadUseCase from "@/app/membership/usecase/read";
import MembershipWriteUseCase from "@/app/membership/usecase/write";

const membershipResolver = {
  Query: {
    memberships: async (_: unknown, args: GqlQueryMembershipsArgs, ctx: IContext) =>
      MembershipReadUseCase.visitorBrowseMemberships(args, ctx),
    membership: async (_: unknown, args: GqlQueryMembershipArgs, ctx: IContext) => {
      if (!ctx.loaders?.membership) {
        return MembershipReadUseCase.visitorViewMembership(args, ctx);
      }
      const key = args.userId && args.communityId ? `${args.userId}:${args.communityId}` : "";
      if (!key) {
        return MembershipReadUseCase.visitorViewMembership(args, ctx);
      }
      return await ctx.loaders.membership.load(key);
    },
  },
  Mutation: {
    membershipInvite: async (_: unknown, args: GqlMutationMembershipInviteArgs, ctx: IContext) =>
      MembershipWriteUseCase.ownerInviteMember(args, ctx),
    membershipCancelInvitation: async (
      _: unknown,
      args: GqlMutationMembershipCancelInvitationArgs,
      ctx: IContext,
    ) => MembershipWriteUseCase.ownerCancelInvitation(args, ctx),
    membershipAcceptMyInvitation: async (
      _: unknown,
      args: GqlMutationMembershipAcceptMyInvitationArgs,
      ctx: IContext,
    ) => MembershipWriteUseCase.userAcceptMyInvitation(args, ctx),
    membershipDenyMyInvitation: async (
      _: unknown,
      args: GqlMutationMembershipDenyMyInvitationArgs,
      ctx: IContext,
    ) => MembershipWriteUseCase.userDenyMyInvitation(args, ctx),
    membershipWithdraw: async (
      _: unknown,
      args: GqlMutationMembershipWithdrawArgs,
      ctx: IContext,
    ) => MembershipWriteUseCase.memberWithdrawCommunity(args, ctx),
    membershipAssignOwner: async (
      _: unknown,
      args: GqlMutationMembershipAssignOwnerArgs,
      ctx: IContext,
    ) => MembershipWriteUseCase.ownerAssignOwner(args, ctx),
    membershipAssignManager: async (
      _: unknown,
      args: GqlMutationMembershipAssignManagerArgs,
      ctx: IContext,
    ) => MembershipWriteUseCase.managerAssignManager(args, ctx),
    membershipAssignMember: async (
      _: unknown,
      args: GqlMutationMembershipAssignMemberArgs,
      ctx: IContext,
    ) => MembershipWriteUseCase.managerAssignMember(args, ctx),
    membershipRemove: async (_: unknown, args: GqlMutationMembershipRemoveArgs, ctx: IContext) =>
      MembershipWriteUseCase.ownerRemoveMember(args, ctx),
  },
};

export default membershipResolver;
