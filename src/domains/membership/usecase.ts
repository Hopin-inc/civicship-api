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
  GqlMembershipInvitePayload,
  GqlMembershipSetInvitationStatusPayload,
  GqlMembershipWithdrawPayload,
  GqlMembershipSetRolePayload,
  GqlMembershipRemovePayload,
  GqlMembershipsConnection,
  GqlMembership,
  GqlMembershipSelfJoinPayload,
  GqlCommunity,
  GqlCommunityMembershipsArgs,
  GqlUserMembershipsArgs,
  GqlUser,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import MembershipService from "@/domains/membership/service";
import MembershipOutputFormat from "@/domains/membership/presenter/output";
import { Role } from "@prisma/client";
import { MembershipUtils } from "@/domains/membership/utils";

export default class MembershipUseCase {
  static async visitorBrowseMemberships(
    { filter, sort, cursor, first }: GqlQueryMembershipsArgs,
    ctx: IContext,
  ): Promise<GqlMembershipsConnection> {
    return MembershipUtils.fetchMembershipsCommon(ctx, {
      cursor,
      sort,
      filter,
      first,
    });
  }

  static async visitorBrowseMembershipsByCommunity(
    { id }: GqlCommunity,
    { first, cursor }: GqlCommunityMembershipsArgs,
    ctx: IContext,
  ): Promise<GqlMembershipsConnection> {
    return MembershipUtils.fetchMembershipsCommon(ctx, {
      cursor,
      filter: { communityId: id },
      first,
    });
  }

  static async visitorBrowseMembershipsByUser(
    { id }: GqlUser,
    { first, cursor }: GqlUserMembershipsArgs,
    ctx: IContext,
  ) {
    return MembershipUtils.fetchMembershipsCommon(ctx, {
      cursor,
      filter: { userId: id },
      first,
    });
  }

  static async visitorViewMembership(
    { userId, communityId }: GqlQueryMembershipArgs,
    ctx: IContext,
  ): Promise<GqlMembership | null> {
    const membership = await MembershipService.findMembership(ctx, userId, communityId);
    return membership ? MembershipOutputFormat.get(membership) : null;
  }

  static async memberInviteMembership(
    { input }: GqlMutationMembershipInviteArgs,
    ctx: IContext,
  ): Promise<GqlMembershipInvitePayload> {
    const membership = await MembershipService.inviteMembership(ctx, input);
    return MembershipOutputFormat.invite(membership);
  }

  static async memberCancelInvitation(
    { input }: GqlMutationMembershipCancelInvitationArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSetInvitationStatusPayload> {
    const membership = await MembershipService.cancelInvitation(ctx, input);
    return MembershipOutputFormat.setInvitationStatus(membership);
  }

  static async userApproveInvitation(
    { input }: GqlMutationMembershipApproveInvitationArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSetInvitationStatusPayload> {
    const membership = await MembershipService.approveInvitation(ctx, input);
    return MembershipOutputFormat.setInvitationStatus(membership);
  }

  static async userDenyInvitation(
    { input }: GqlMutationMembershipDenyInvitationArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSetInvitationStatusPayload> {
    const membership = await MembershipService.denyInvitation(ctx, input);
    return MembershipOutputFormat.setInvitationStatus(membership);
  }

  static async userSelfJoin(
    { input }: GqlMutationMembershipSelfJoinArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSelfJoinPayload> {
    const membership = await MembershipService.selfJoinCommunity(ctx, input);
    return MembershipOutputFormat.selfJoin(membership);
  }

  static async memberWithdrawCommunity(
    { input }: GqlMutationMembershipWithdrawArgs,
    ctx: IContext,
  ): Promise<GqlMembershipWithdrawPayload> {
    const membership = await MembershipService.withdrawCommunity(ctx, input);
    return MembershipOutputFormat.withdraw(membership);
  }

  static async ownerRemoveMembership(
    { input }: GqlMutationMembershipRemoveArgs,
    ctx: IContext,
  ): Promise<GqlMembershipRemovePayload> {
    const membership = await MembershipService.removeMember(ctx, input);
    return MembershipOutputFormat.remove(membership);
  }

  static async ownerAssignOwner(
    { input }: GqlMutationMembershipAssignOwnerArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSetRolePayload> {
    const membership = await MembershipService.assignRole(ctx, input, Role.OWNER);
    return MembershipOutputFormat.setRole(membership);
  }

  static async ownerAssignManager(
    { input }: GqlMutationMembershipAssignManagerArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSetRolePayload> {
    const membership = await MembershipService.assignRole(ctx, input, Role.MANAGER);
    return MembershipOutputFormat.setRole(membership);
  }

  static async ownerAssignMember(
    { input }: GqlMutationMembershipAssignMemberRoleArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSetRolePayload> {
    const membership = await MembershipService.assignRole(ctx, input, Role.MEMBER);
    return MembershipOutputFormat.setRole(membership);
  }
}
