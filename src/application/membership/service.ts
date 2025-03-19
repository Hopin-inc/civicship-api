import {
  GqlMembershipCursorInput,
  GqlMembershipFilterInput,
  GqlMembershipInviteInput,
  GqlMembershipsConnection,
  GqlMembershipSetInvitationStatusInput,
  GqlMembershipSetRoleInput,
  GqlMembershipSortInput,
} from "@/types/graphql";
import MembershipConverter from "@/application/membership/data/converter";
import MembershipRepository from "@/application/membership/data/repository";
import { IContext } from "@/types/server";
import { MembershipStatus, MembershipStatusReason, Prisma, Role } from "@prisma/client";
import { clampFirst, getCurrentUserId } from "@/application/utils";
import { NotFoundError } from "@/errors/graphql";
import MembershipPresenter from "@/application/membership/presenter";

export default class MembershipService {
  static async fetchMemberships(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: GqlMembershipCursorInput;
      filter?: GqlMembershipFilterInput;
      sort?: GqlMembershipSortInput;
      first?: number;
    },
  ): Promise<GqlMembershipsConnection> {
    const take = clampFirst(first);

    const where = MembershipConverter.filter(filter ?? {});
    const orderBy = MembershipConverter.sort(sort ?? {});

    const res = await MembershipRepository.query(ctx, where, orderBy, take + 1, cursor);

    const hasNextPage = res.length > take;
    const data = res.slice(0, take).map((record) => MembershipPresenter.get(record));

    return MembershipPresenter.query(data, hasNextPage);
  }

  static async findMembership(ctx: IContext, userId: string, communityId: string) {
    return MembershipRepository.find(ctx, { userId_communityId: { userId, communityId } });
  }

  static async findMembershipOrThrow(ctx: IContext, userId: string, communityId: string) {
    const membership = await MembershipRepository.find(ctx, {
      userId_communityId: { userId, communityId },
    });
    if (!membership) {
      throw new NotFoundError("Membership", { userId, communityId });
    }
    return membership;
  }

  static async inviteMember(ctx: IContext, input: GqlMembershipInviteInput) {
    const currentUserId = getCurrentUserId(ctx);

    const data: Prisma.MembershipCreateInput = MembershipConverter.invite(
      input.userId,
      input.communityId,
      currentUserId,
      input.role,
    );
    return MembershipRepository.create(ctx, data);
  }

  static async joinIfNeeded(
    ctx: IContext,
    currentUserId: string,
    communityId: string,
    tx: Prisma.TransactionClient,
    joinedUserId?: string,
  ) {
    let membership = await MembershipRepository.find(
      ctx,
      { userId_communityId: { userId: joinedUserId ?? currentUserId, communityId } },
      tx,
    );

    if (!membership) {
      const data: Prisma.MembershipCreateInput = MembershipConverter.join(
        currentUserId,
        communityId,
        joinedUserId,
      );
      membership = await MembershipRepository.create(ctx, data, tx);
    } else {
      if (membership.status !== MembershipStatus.JOINED) {
        const data = MembershipConverter.update(
          MembershipStatus.JOINED,
          MembershipStatusReason.ACCEPTED_INVITATION,
          membership.role,
          currentUserId,
        );
        membership = await MembershipRepository.update(
          ctx,
          { userId_communityId: { userId: joinedUserId ?? currentUserId, communityId } },
          data,
          tx,
        );
      }
    }

    return membership;
  }

  static async setStatus(
    ctx: IContext,
    { userId, communityId }: GqlMembershipSetInvitationStatusInput,
    status: MembershipStatus,
    reason: MembershipStatusReason,
  ) {
    const currentUserId = getCurrentUserId(ctx);
    const membership = await this.findMembershipOrThrow(ctx, userId, communityId);

    const data: Prisma.MembershipUpdateInput = MembershipConverter.update(
      status,
      reason,
      membership.role,
      currentUserId,
    );
    return MembershipRepository.update(ctx, { userId_communityId: { userId, communityId } }, data);
  }

  static async setRole(
    ctx: IContext,
    { userId, communityId }: GqlMembershipSetRoleInput,
    role: Role,
  ) {
    const currentUserId = getCurrentUserId(ctx);
    const membership = await this.findMembershipOrThrow(ctx, userId, communityId);

    const data: Prisma.MembershipUpdateInput = MembershipConverter.update(
      membership.status,
      MembershipStatusReason.ASSIGNED,
      role,
      currentUserId,
    );
    return await MembershipRepository.update(
      ctx,
      { userId_communityId: { userId, communityId } },
      data,
    );
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
      throw new NotFoundError("Membership", { userId, communityId });
    }

    await MembershipRepository.delete(ctx, { userId_communityId: { userId, communityId } }, tx);

    return membership;
  }
}
