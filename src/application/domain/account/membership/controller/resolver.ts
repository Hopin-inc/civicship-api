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

const membershipResolver = {
  Query: {
    memberships: async (_: unknown, args: GqlQueryMembershipsArgs, ctx: IContext) =>
      container.resolve(MembershipUseCase).visitorBrowseMemberships(args, ctx),
    membership: async (_: unknown, args: GqlQueryMembershipArgs, ctx: IContext) =>
      container.resolve(MembershipUseCase).visitorViewMembership(args, ctx),
  },
  Mutation: {
    membershipInvite: async (_: unknown, args: GqlMutationMembershipInviteArgs, ctx: IContext) =>
      container.resolve(MembershipUseCase).ownerInviteMember(args, ctx),
    membershipCancelInvitation: async (
      _: unknown,
      args: GqlMutationMembershipCancelInvitationArgs,
      ctx: IContext,
    ) => container.resolve(MembershipUseCase).ownerCancelInvitation(args, ctx),
    membershipAcceptMyInvitation: async (
      _: unknown,
      args: GqlMutationMembershipAcceptMyInvitationArgs,
      ctx: IContext,
    ) => container.resolve(MembershipUseCase).userAcceptMyInvitation(args, ctx),
    membershipDenyMyInvitation: async (
      _: unknown,
      args: GqlMutationMembershipDenyMyInvitationArgs,
      ctx: IContext,
    ) => container.resolve(MembershipUseCase).userDenyMyInvitation(args, ctx),
    membershipWithdraw: async (
      _: unknown,
      args: GqlMutationMembershipWithdrawArgs,
      ctx: IContext,
    ) => container.resolve(MembershipUseCase).memberWithdrawCommunity(args, ctx),
    membershipAssignOwner: async (
      _: unknown,
      args: GqlMutationMembershipAssignOwnerArgs,
      ctx: IContext,
    ) => container.resolve(MembershipUseCase).ownerAssignOwner(args, ctx),
    membershipAssignManager: async (
      _: unknown,
      args: GqlMutationMembershipAssignManagerArgs,
      ctx: IContext,
    ) => container.resolve(MembershipUseCase).managerAssignManager(args, ctx),
    membershipAssignMember: async (
      _: unknown,
      args: GqlMutationMembershipAssignMemberArgs,
      ctx: IContext,
    ) => container.resolve(MembershipUseCase).managerAssignMember(args, ctx),
    membershipRemove: async (_: unknown, args: GqlMutationMembershipRemoveArgs, ctx: IContext) =>
      container.resolve(MembershipUseCase).ownerRemoveMember(args, ctx),
  },
};

export default membershipResolver;
