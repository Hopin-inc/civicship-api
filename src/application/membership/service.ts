import {
  GqlMembershipCancelInvitationInput,
  GqlMembershipDenyMyInvitationInput,
  GqlMembershipInviteInput,
  GqlQueryMembershipsArgs,
} from "@/types/graphql";
import MembershipInputFormat from "@/presentation/graphql/dto/membership/input";
import MembershipRepository from "@/infrastructure/repositories/membership";
import { IContext } from "@/types/server";
import { MembershipStatus, Prisma, Role } from "@prisma/client";
import { getCurrentUserId } from "@/utils";
import MembershipUtils from "@/application/membership/utils";

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

  static async cancelInvitation(
    ctx: IContext,
    { userId, communityId }: GqlMembershipCancelInvitationInput,
  ) {
    return MembershipUtils.setMembershipStatus(ctx, userId, communityId, MembershipStatus.CANCELED);
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

  static async joinIfNeeded(
    ctx: IContext,
    userId: string,
    communityId: string,
    tx: Prisma.TransactionClient,
  ) {
    let membership = await MembershipRepository.find(
      ctx,
      { userId_communityId: { userId, communityId } },
      tx,
    );

    if (!membership) {
      const data: Prisma.MembershipCreateInput = MembershipInputFormat.join({
        userId,
        communityId,
      });
      membership = await MembershipRepository.create(ctx, data, tx);
    } else {
      if (membership.status !== MembershipStatus.JOINED) {
        const data = MembershipInputFormat.setStatus(MembershipStatus.JOINED);
        membership = await MembershipRepository.setStatus(
          ctx,
          { userId_communityId: { userId, communityId } },
          data,
          tx,
        );
      }
    }

    return membership;
  }

  static async assignRole(ctx: IContext, userId: string, communityId: string, role: Role) {
    const membership = await MembershipRepository.find(ctx, {
      userId_communityId: { userId, communityId },
    });
    if (!membership) {
      throw new Error(`MembershipNotFound: userId=${userId}, communityId=${communityId}`);
    }

    const data: Prisma.EnumRoleFieldUpdateOperationsInput = MembershipInputFormat.setRole(role);
    return MembershipRepository.setRole(ctx, { userId_communityId: { userId, communityId } }, data);
  }

  static async deleteMembership(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    userId: string,
    communityId: string,
  ) {
    const membership = await MembershipRepository.find(
      ctx,
      { userId_communityId: { userId, communityId } },
      tx,
    );
    if (!membership) {
      throw new Error(`MembershipNotFound: userId=${userId}, communityId=${communityId}`);
    }

    await MembershipRepository.delete(ctx, { userId_communityId: { userId, communityId } }, tx);

    return membership;
  }
}
