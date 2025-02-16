import {
  GqlQueryMembershipsArgs,
  GqlQueryMembershipArgs,
  GqlMutationMembershipInviteArgs,
  GqlMutationMembershipCancelInvitationArgs,
  GqlMutationMembershipWithdrawArgs,
  GqlMutationMembershipAssignOwnerArgs,
  GqlMutationMembershipAssignManagerArgs,
  GqlMutationMembershipRemoveArgs,
  GqlMembershipInvitePayload,
  GqlMembershipSetInvitationStatusPayload,
  GqlMembershipWithdrawPayload,
  GqlMembershipSetRolePayload,
  GqlMembershipRemovePayload,
  GqlMembershipsConnection,
  GqlMembership,
  GqlCommunity,
  GqlCommunityMembershipsArgs,
  GqlUserMembershipsArgs,
  GqlUser,
  GqlMutationMembershipAssignMemberArgs,
  GqlMutationMembershipAcceptMyInvitationArgs,
  GqlMutationMembershipDenyMyInvitationArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import MembershipService from "@/application/membership/service";
import MembershipOutputFormat from "@/presentation/graphql/dto/membership/output";
import { Prisma, Role } from "@prisma/client";
import MembershipUtils from "@/application/membership/utils";
import { getCurrentUserId } from "@/utils";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import WalletService from "@/application/membership/wallet/service";

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

  static async ownerInviteMember(
    { input }: GqlMutationMembershipInviteArgs,
    ctx: IContext,
  ): Promise<GqlMembershipInvitePayload> {
    const membership = await MembershipService.inviteMember(ctx, input);
    return MembershipOutputFormat.invite(membership);
  }

  static async ownerCancelInvitation(
    { input }: GqlMutationMembershipCancelInvitationArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSetInvitationStatusPayload> {
    const membership = await MembershipService.cancelInvitation(ctx, input);
    return MembershipOutputFormat.setInvitationStatus(membership);
  }

  static async userAcceptMyInvitation(
    { input }: GqlMutationMembershipAcceptMyInvitationArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSetInvitationStatusPayload> {
    const userId = getCurrentUserId(ctx);

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      const membership = await MembershipService.joinIfNeeded(ctx, userId, input.communityId, tx);
      await WalletService.createMemberWalletIfNeeded(ctx, userId, input.communityId, tx);

      return MembershipOutputFormat.setInvitationStatus(membership);
    });
  }

  static async userDenyMyInvitation(
    { input }: GqlMutationMembershipDenyMyInvitationArgs,
    ctx: IContext,
  ): Promise<GqlMembershipSetInvitationStatusPayload> {
    const membership = await MembershipService.denyInvitation(ctx, input);
    return MembershipOutputFormat.setInvitationStatus(membership);
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

      return MembershipOutputFormat.withdraw({
        userId,
        communityId,
      });
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

      return MembershipOutputFormat.remove({
        userId,
        communityId,
      });
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
    return MembershipOutputFormat.setRole(membership);
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
    return MembershipOutputFormat.setRole(membership);
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
    return MembershipOutputFormat.setRole(membership);
  }
}
