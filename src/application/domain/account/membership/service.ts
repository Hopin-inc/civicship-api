import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import {
  GqlMembershipInviteInput,
  GqlMembershipSetInvitationStatusInput,
  GqlMembershipSetRoleInput,
  GqlQueryMembershipsArgs,
} from "@/types/graphql";
import { MembershipStatus, MembershipStatusReason, Role } from "@prisma/client";
import { getCurrentUserId } from "@/application/domain/utils";
import { NotFoundError } from "@/errors/graphql";
import { IMembershipRepository } from "@/application/domain/account/membership/data/interface";
import MembershipConverter from "@/application/domain/account/membership/data/converter";
import { inject, injectable } from "tsyringe";

@injectable()
export default class MembershipService {
  constructor(
    @inject("MembershipRepository") private readonly repository: IMembershipRepository,
    @inject("MembershipConverter") private readonly converter: MembershipConverter,
    @inject("getCurrentUserId") private readonly currentUserId: typeof getCurrentUserId,
  ) {}

  async fetchMemberships(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryMembershipsArgs,
    take: number,
  ) {
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});
    return this.repository.query(ctx, where, orderBy, take, cursor);
  }

  async findMembershipDetail(ctx: IContext, userId: string, communityId: string) {
    return this.repository.findDetail(ctx, { userId_communityId: { userId, communityId } });
  }

  async findMembership(ctx: IContext, userId: string, communityId: string) {
    return this.repository.find(ctx, { userId_communityId: { userId, communityId } });
  }

  async findMembershipOrThrow(ctx: IContext, userId: string, communityId: string) {
    const membership = await this.findMembership(ctx, userId, communityId);
    if (!membership) {
      throw new NotFoundError("Membership", { userId, communityId });
    }
    return membership;
  }

  async inviteMember(ctx: IContext, input: GqlMembershipInviteInput, tx: Prisma.TransactionClient) {
    const currentUserId = this.currentUserId(ctx);
    const data = this.converter.invite(input.userId, input.communityId, currentUserId, input.role);
    return this.repository.create(ctx, data, tx);
  }

  async joinIfNeeded(
    ctx: IContext,
    currentUserId: string,
    communityId: string,
    tx: Prisma.TransactionClient,
    joinedUserId?: string,
  ) {
    let membership = await this.repository.find(ctx, {
      userId_communityId: { userId: joinedUserId ?? currentUserId, communityId },
    });

    if (!membership) {
      const data = this.converter.join(currentUserId, communityId, joinedUserId);
      membership = await this.repository.create(ctx, data, tx);
    } else if (membership.status !== MembershipStatus.JOINED) {
      const data = this.converter.update(
        MembershipStatus.JOINED,
        MembershipStatusReason.ACCEPTED_INVITATION,
        membership.role,
        currentUserId,
      );
      membership = await this.repository.update(
        ctx,
        { userId_communityId: { userId: joinedUserId ?? currentUserId, communityId } },
        data,
        tx,
      );
    }

    return membership;
  }

  async setStatus(
    ctx: IContext,
    { userId, communityId }: GqlMembershipSetInvitationStatusInput,
    status: MembershipStatus,
    reason: MembershipStatusReason,
    tx: Prisma.TransactionClient,
  ) {
    const currentUserId = this.currentUserId(ctx);
    const membership = await this.findMembershipOrThrow(ctx, userId, communityId);

    const data = this.converter.update(status, reason, membership.role, currentUserId);
    return this.repository.update(ctx, { userId_communityId: { userId, communityId } }, data, tx);
  }

  async setRole(
    ctx: IContext,
    { userId, communityId }: GqlMembershipSetRoleInput,
    role: Role,
    tx: Prisma.TransactionClient,
  ) {
    const currentUserId = this.currentUserId(ctx);
    const membership = await this.findMembershipOrThrow(ctx, userId, communityId);

    const data = this.converter.update(
      membership.status,
      MembershipStatusReason.ASSIGNED,
      role,
      currentUserId,
    );
    return this.repository.update(ctx, { userId_communityId: { userId, communityId } }, data, tx);
  }

  async deleteMembership(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    userId: string,
    communityId: string,
  ) {
    const membership = await this.repository.find(ctx, {
      userId_communityId: { userId, communityId },
    });
    if (!membership) {
      throw new NotFoundError("Membership", { userId, communityId });
    }
    await this.repository.delete(ctx, { userId_communityId: { userId, communityId } }, tx);
    return membership;
  }
}
