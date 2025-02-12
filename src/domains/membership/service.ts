import {
  GqlMembershipAcceptMyInvitationInput,
  GqlMembershipAssignManagerInput,
  GqlMembershipAssignMemberInput,
  GqlMembershipAssignOwnerInput,
  GqlMembershipCancelInvitationInput,
  GqlMembershipDenyMyInvitationInput,
  GqlMembershipInviteInput,
  GqlMembershipRemoveInput,
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
import { prismaClient } from "@/prisma/client";

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

  static async inviteMember(ctx: IContext, input: GqlMembershipInviteInput) {
    const data: Prisma.MembershipCreateInput = MembershipInputFormat.invite(input);
    return MembershipRepository.create(ctx, data);
  }

  static async removeMember(ctx: IContext, { userId, communityId }: GqlMembershipRemoveInput) {
    return MembershipUtils.deleteMembership(ctx, userId, communityId);
  }

  static async withdrawCommunity(ctx: IContext, input: GqlMembershipWithdrawInput) {
    const userId = getCurrentUserId(ctx);
    return MembershipUtils.deleteMembership(ctx, userId, input.communityId);
  }

  static async cancelInvitation(
    ctx: IContext,
    { userId, communityId }: GqlMembershipCancelInvitationInput,
  ) {
    return MembershipUtils.setMembershipStatus(ctx, userId, communityId, MembershipStatus.CANCELED);
  }

  static async acceptInvitation(
    ctx: IContext,
    { communityId }: GqlMembershipAcceptMyInvitationInput,
  ) {
    const userId = getCurrentUserId(ctx);

    const data: Prisma.EnumMembershipStatusFieldUpdateOperationsInput =
      MembershipInputFormat.setStatus(MembershipStatus.JOINED);

    return prismaClient.$transaction(async (tx) => {
      const membership = await MembershipRepository.setStatus(
        ctx,
        { userId_communityId: { userId, communityId } },
        data,
        tx,
      );

      await WalletService.createMemberWallet(ctx, userId, communityId, tx);
      return membership;
    });
  }

  static async denyInvitation(ctx: IContext, input: GqlMembershipDenyMyInvitationInput) {
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
    return MembershipUtils.setMembershipRole(ctx, userId, communityId, role);
  }
}
