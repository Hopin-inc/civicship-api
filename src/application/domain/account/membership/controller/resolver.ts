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
import { injectable, inject } from "tsyringe";
import MembershipUseCase from "@/application/domain/account/membership/usecase";
import { PrismaMembershipDetail } from "@/application/domain/account/membership/data/type";

@injectable()
export default class MembershipResolver {
  constructor(@inject("MembershipUseCase") private readonly useCase: MembershipUseCase) {}

  Query = {
    memberships: (_: unknown, args: GqlQueryMembershipsArgs, ctx: IContext) =>
      this.useCase.visitorBrowseMemberships(args, ctx),
    membership: (_: unknown, args: { communityId: string, userKey: string }, ctx: IContext) => {
      return this.useCase.visitorViewMembership(args, ctx);
    },
  };

  Mutation = {
    membershipInvite: (_: unknown, args: GqlMutationMembershipInviteArgs, ctx: IContext) =>
      this.useCase.ownerInviteMember(args, ctx),
    membershipCancelInvitation: (
      _: unknown,
      args: GqlMutationMembershipCancelInvitationArgs,
      ctx: IContext,
    ) => this.useCase.ownerCancelInvitation(args, ctx),
    membershipAcceptMyInvitation: (
      _: unknown,
      args: GqlMutationMembershipAcceptMyInvitationArgs,
      ctx: IContext,
    ) => this.useCase.userAcceptMyInvitation(args, ctx),
    membershipDenyMyInvitation: (
      _: unknown,
      args: GqlMutationMembershipDenyMyInvitationArgs,
      ctx: IContext,
    ) => this.useCase.userDenyMyInvitation(args, ctx),
    membershipWithdraw: (_: unknown, args: GqlMutationMembershipWithdrawArgs, ctx: IContext) =>
      this.useCase.memberWithdrawCommunity(args, ctx),
    membershipAssignOwner: (
      _: unknown,
      args: GqlMutationMembershipAssignOwnerArgs,
      ctx: IContext,
    ) => this.useCase.ownerAssignOwner(args, ctx),
    membershipAssignManager: (
      _: unknown,
      args: GqlMutationMembershipAssignManagerArgs,
      ctx: IContext,
    ) => this.useCase.managerAssignManager(args, ctx),
    membershipAssignMember: (
      _: unknown,
      args: GqlMutationMembershipAssignMemberArgs,
      ctx: IContext,
    ) => this.useCase.managerAssignMember(args, ctx),
    membershipRemove: (_: unknown, args: GqlMutationMembershipRemoveArgs, ctx: IContext) =>
      this.useCase.ownerRemoveMember(args, ctx),
  };

  Membership = {
    user: (parent: PrismaMembershipDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.user.load(parent.userId);
    },

    community: (parent: PrismaMembershipDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.community.load(parent.communityId);
    },

    histories: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.membershipHistoriesByMembership.load({
        userId: parent.userId,
        communityId: parent.communityId,
      });
    },
  };
}
