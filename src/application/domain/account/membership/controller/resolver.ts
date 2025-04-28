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
import "reflect-metadata";
import { container } from "tsyringe";
import MembershipUseCase from "@/application/domain/account/membership/usecase";

const membershipUseCase = container.resolve(MembershipUseCase);

const membershipResolver = {
  Query: {
    memberships: async (_: unknown, args: GqlQueryMembershipsArgs, ctx: IContext) =>
      membershipUseCase.visitorBrowseMemberships(args, ctx),
    membership: async (_: unknown, args: GqlQueryMembershipArgs, ctx: IContext) => {
      return membershipUseCase.visitorViewMembership(args, ctx);
    },
  },
  Mutation: {
    membershipInvite: async (_: unknown, args: GqlMutationMembershipInviteArgs, ctx: IContext) =>
      membershipUseCase.ownerInviteMember(args, ctx),
    membershipCancelInvitation: async (
      _: unknown,
      args: GqlMutationMembershipCancelInvitationArgs,
      ctx: IContext,
    ) => membershipUseCase.ownerCancelInvitation(args, ctx),
    membershipAcceptMyInvitation: async (
      _: unknown,
      args: GqlMutationMembershipAcceptMyInvitationArgs,
      ctx: IContext,
    ) => membershipUseCase.userAcceptMyInvitation(args, ctx),
    membershipDenyMyInvitation: async (
      _: unknown,
      args: GqlMutationMembershipDenyMyInvitationArgs,
      ctx: IContext,
    ) => membershipUseCase.userDenyMyInvitation(args, ctx),
    membershipWithdraw: async (
      _: unknown,
      args: GqlMutationMembershipWithdrawArgs,
      ctx: IContext,
    ) => membershipUseCase.memberWithdrawCommunity(args, ctx),
    membershipAssignOwner: async (
      _: unknown,
      args: GqlMutationMembershipAssignOwnerArgs,
      ctx: IContext,
    ) => membershipUseCase.ownerAssignOwner(args, ctx),
    membershipAssignManager: async (
      _: unknown,
      args: GqlMutationMembershipAssignManagerArgs,
      ctx: IContext,
    ) => membershipUseCase.managerAssignManager(args, ctx),
    membershipAssignMember: async (
      _: unknown,
      args: GqlMutationMembershipAssignMemberArgs,
      ctx: IContext,
    ) => membershipUseCase.managerAssignMember(args, ctx),
    membershipRemove: async (_: unknown, args: GqlMutationMembershipRemoveArgs, ctx: IContext) =>
      membershipUseCase.ownerRemoveMember(args, ctx),
  },
};

export default membershipResolver;
