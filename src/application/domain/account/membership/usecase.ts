import {
  GqlQueryMembershipsArgs,
  GqlQueryMembershipArgs,
  GqlMembershipsConnection,
  GqlMembership,
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
import MembershipPresenter from "@/application/domain/account/membership/presenter";
import MembershipService from "@/application/domain/account/membership/service";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import { MembershipStatus, MembershipStatusReason, Prisma, Role } from "@prisma/client";
import WalletService from "@/application/domain/account/wallet/service";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

export default class MembershipUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseMemberships(
    { filter, sort, cursor, first }: GqlQueryMembershipsArgs,
    ctx: IContext,
  ): Promise<GqlMembershipsConnection> {
    const take = clampFirst(first);

    const records = await MembershipService.fetchMemberships(
      ctx,
      {
        cursor,
        sort,
        filter,
      },
      take,
    );

    const hasNextPage = records.length > take;
    const data = records.slice(0, take).map(MembershipPresenter.get);
    return MembershipPresenter.query(data, hasNextPage);
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
    const membership = await MembershipService.setStatus(
      ctx,
      input,
      MembershipStatus.LEFT,
      MembershipStatusReason.CANCELED_INVITATION,
    );
    return MembershipPresenter.setInvitationStatus(membership);
  }

  static async userAcceptMyInvitation(
    { input }: GqlMutationMembershipAcceptMyInvitationArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSetInvitationStatusPayload> {
    const currentUserId = getCurrentUserId(ctx);
    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      const membership = await MembershipService.joinIfNeeded(
        ctx,
        currentUserId,
        input.communityId,
        tx,
      );
      await WalletService.createMemberWalletIfNeeded(ctx, currentUserId, input.communityId, tx);
      return MembershipPresenter.setInvitationStatus(membership);
    });
  }

  static async userDenyMyInvitation(
    { input }: GqlMutationMembershipDenyMyInvitationArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSetInvitationStatusPayload> {
    const userId = getCurrentUserId(ctx);
    const { communityId } = input;

    const membership = await MembershipService.setStatus(
      ctx,
      { userId, communityId },
      MembershipStatus.LEFT,
      MembershipStatusReason.DECLINED_INVITATION,
    );
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
    const membership = await MembershipService.setRole(ctx, input, Role.OWNER);
    return MembershipPresenter.setRole(membership);
  }

  static async managerAssignManager(
    { input }: GqlMutationMembershipAssignManagerArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSetRolePayload> {
    const membership = await MembershipService.setRole(ctx, input, Role.MANAGER);
    return MembershipPresenter.setRole(membership);
  }

  static async managerAssignMember(
    { input }: GqlMutationMembershipAssignMemberArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSetRolePayload> {
    const membership = await MembershipService.setRole(ctx, input, Role.MEMBER);
    return MembershipPresenter.setRole(membership);
  }
}
