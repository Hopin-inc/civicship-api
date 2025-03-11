import {
  GqlQueryMembershipsArgs,
  GqlQueryMembershipArgs,
  GqlMembershipsConnection,
  GqlMembership,
  GqlCommunity,
  GqlCommunityMembershipsArgs,
  GqlUserMembershipsArgs,
  GqlUser,
  GqlMutationMembershipInviteArgs,
  GqlMembershipInvitePayload,
  GqlMutationMembershipCancelInvitationArgs,
  GqlMembershipSetInvitationStatusPayload,
  GqlMutationMembershipAcceptMyInvitationArgs,
  GqlMutationMembershipDenyMyInvitationArgs,
  GqlMutationMembershipWithdrawArgs,
  GqlMembershipWithdrawPayload,
  GqlMutationMembershipRemoveArgs,
  GqlMembershipRemovePayload,
  GqlMutationMembershipAssignOwnerArgs,
  GqlMembershipSetRolePayload,
  GqlMutationMembershipAssignManagerArgs,
  GqlMutationMembershipAssignMemberArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import MembershipUtils from "@/application/membership/utils";
import MembershipPresenter from "@/application/membership/presenter";
import MembershipService from "@/application/membership/service";
import { getCurrentUserId } from "@/utils";
import { Prisma, Role } from "@prisma/client";
import WalletService from "@/application/membership/wallet/service";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

export default class MembershipUseCase {
  private static issuer = new PrismaClientIssuer();

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
  ): Promise<GqlMembershipsConnection> {
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
    return membership ? MembershipPresenter.get(membership) : null;
  }

  static async ownerInviteMember(
    { input }: GqlMutationMembershipInviteArgs,
    ctx: IContext,
  ): Promise<GqlMembershipInvitePayload> {
    const membership = await MembershipService.inviteMember(ctx, input);
    return MembershipPresenter.invite(membership);
  }

  static async ownerCancelInvitation(
    { input }: GqlMutationMembershipCancelInvitationArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSetInvitationStatusPayload> {
    const membership = await MembershipService.cancelInvitation(ctx, input);
    return MembershipPresenter.setInvitationStatus(membership);
  }

  static async userAcceptMyInvitation(
    { input }: GqlMutationMembershipAcceptMyInvitationArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSetInvitationStatusPayload> {
    const userId = getCurrentUserId(ctx);
    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      const membership = await MembershipService.joinIfNeeded(ctx, userId, input.communityId, tx);
      await WalletService.createMemberWalletIfNeeded(ctx, userId, input.communityId, tx);
      return MembershipPresenter.setInvitationStatus(membership);
    });
  }

  static async userDenyMyInvitation(
    { input }: GqlMutationMembershipDenyMyInvitationArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSetInvitationStatusPayload> {
    const membership = await MembershipService.denyInvitation(ctx, input);
    return MembershipPresenter.setInvitationStatus(membership);
  }

  static async memberWithdrawCommunity(
    { input }: GqlMutationMembershipWithdrawArgs,
    ctx: IContext,
  ): Promise<GqlMembershipWithdrawPayload> {
    const userId = getCurrentUserId(ctx);
    const { communityId } = input;
    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      await MembershipService.deleteMembership(ctx, tx, userId, communityId);
      await WalletService.deleteMemberWallet(ctx, userId, communityId, tx);
      return MembershipPresenter.withdraw({ userId, communityId });
    });
  }

  static async ownerRemoveMember(
    { input }: GqlMutationMembershipRemoveArgs,
    ctx: IContext,
  ): Promise<GqlMembershipRemovePayload> {
    const { userId, communityId } = input;
    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      await MembershipService.deleteMembership(ctx, tx, userId, communityId);
      await WalletService.deleteMemberWallet(ctx, userId, communityId, tx);
      return MembershipPresenter.remove({ userId, communityId });
    });
  }

  static async ownerAssignOwner(
    { input }: GqlMutationMembershipAssignOwnerArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSetRolePayload> {
    const membership = await MembershipService.assignRole(
      ctx,
      input.userId,
      input.communityId,
      Role.OWNER,
    );
    return MembershipPresenter.setRole(membership);
  }

  static async managerAssignManager(
    { input }: GqlMutationMembershipAssignManagerArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSetRolePayload> {
    const membership = await MembershipService.assignRole(
      ctx,
      input.userId,
      input.communityId,
      Role.MANAGER,
    );
    return MembershipPresenter.setRole(membership);
  }

  static async managerAssignMember(
    { input }: GqlMutationMembershipAssignMemberArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSetRolePayload> {
    const membership = await MembershipService.assignRole(
      ctx,
      input.userId,
      input.communityId,
      Role.MEMBER,
    );
    return MembershipPresenter.setRole(membership);
  }
}
