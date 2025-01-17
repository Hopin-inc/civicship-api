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
} from "@/types/graphql";
import { IContext } from "@/types/server";
import MembershipService from "@/domains/membership/service";
import MembershipOutputFormat from "@/domains/membership/presenter/output";
import { Role } from "@prisma/client";

export default class MembershipUseCase {
  static async visitorBrowseMemberships(
    { filter, sort, cursor, first }: GqlQueryMembershipsArgs,
    ctx: IContext,
  ): Promise<GqlMembershipsConnection> {
    const take = first ?? 10;
    const res = await MembershipService.fetchMemberships(ctx, { filter, sort, cursor }, take);
    const hasNextPage = res.length > take;

    const data: GqlMembership[] = res.slice(0, take).map((record) => {
      return MembershipOutputFormat.get(record);
    });

    return MembershipOutputFormat.query(data, hasNextPage);
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
  ): Promise<GqlMembershipInvitePayload> {
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
