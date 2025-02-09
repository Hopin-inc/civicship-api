import {
  GqlMembershipApproveInvitationInput,
  GqlMembershipAssignManagerInput,
  GqlMembershipAssignMemberInput,
  GqlMembershipAssignOwnerInput,
  GqlMembershipCancelInvitationInput,
  GqlMembershipDenyInvitationInput,
  GqlMembershipInviteInput,
  GqlMembershipRemoveInput,
  GqlMembershipSelfJoinInput,
  GqlMembershipWithdrawInput,
  GqlQueryMembershipsArgs,
} from "@/types/graphql";
import MembershipInputFormat from "@/domains/membership/presenter/input";
import MembershipRepository from "@/domains/membership/repository";
import { IContext } from "@/types/server";
import { MembershipStatus, Prisma, Role } from "@prisma/client";
import { MembershipUtils } from "@/domains/membership/utils";
import { getCurrentUserId } from "@/utils";
import WalletService from "@/domains/membership/wallet/service";

export default class MembershipService {
  static async fetchMemberships(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryMembershipsArgs,
    take: number,
  ) {
    const where = MembershipInputFormat.filter(filter ?? {});
    const orderBy = MembershipInputFormat.sort(sort ?? {});

    return await MembershipRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findMembership(ctx: IContext, userId: string, communityId: string) {
    return MembershipRepository.find(ctx, { userId_communityId: { userId, communityId } });
  }

  static async inviteMembership(ctx: IContext, input: GqlMembershipInviteInput) {
    const data: Prisma.MembershipCreateInput = MembershipInputFormat.invite(input);
    return MembershipRepository.create(ctx, data);
  }

  static async selfJoinCommunity(ctx: IContext, input: GqlMembershipSelfJoinInput) {
    const { communityId } = input;
    const userId = getCurrentUserId(ctx);

    const data: Prisma.MembershipCreateInput = MembershipInputFormat.selfJoin(
      userId,
      input.communityId,
    );
    const membership = MembershipRepository.create(ctx, data);

    await WalletService.createMemberWallet(ctx, userId, communityId);
    return membership;
  }

  static async removeMember(ctx: IContext, input: GqlMembershipRemoveInput) {
    const { userId, communityId } = input;
    return MembershipUtils.deleteMembership(ctx, userId, communityId);
  }

  static async withdrawCommunity(ctx: IContext, input: GqlMembershipWithdrawInput) {
    const userId = getCurrentUserId(ctx);
    return MembershipUtils.deleteMembership(ctx, userId, input.communityId);
  }

  static async cancelInvitation(ctx: IContext, input: GqlMembershipCancelInvitationInput) {
    const { userId, communityId } = input;
    return MembershipUtils.setMembershipStatus(ctx, userId, communityId, MembershipStatus.CANCELED);
  }

  static async approveInvitation(ctx: IContext, input: GqlMembershipApproveInvitationInput) {
    const { communityId } = input;
    const userId = getCurrentUserId(ctx);

    const membership = MembershipUtils.setMembershipStatus(
      ctx,
      userId,
      communityId,
      MembershipStatus.JOINED,
    );

    await WalletService.createMemberWallet(ctx, userId, communityId);
    return membership;
  }

  static async denyInvitation(ctx: IContext, input: GqlMembershipDenyInvitationInput) {
    const { communityId } = input;
    const currentUserId = getCurrentUserId(ctx);

    return MembershipUtils.setMembershipStatus(
      ctx,
      currentUserId,
      communityId,
      MembershipStatus.CANCELED,
    );
  }

  static async assignRole(
    ctx: IContext,
    input:
      | GqlMembershipAssignOwnerInput
      | GqlMembershipAssignManagerInput
      | GqlMembershipAssignMemberInput,
    role: Role,
  ) {
    const { userId, communityId } = input;
    return MembershipUtils.updateMembershipRole(ctx, userId, communityId, role);
  }
}
