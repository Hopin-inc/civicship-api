import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  membershipInclude,
  membershipSelectDetail,
} from "@/application/domain/account/membership/data/type";
import { IMembershipRepository } from "@/application/domain/account/membership/data/interface";
import { injectable } from "tsyringe";

@injectable()
export default class MembershipRepository implements IMembershipRepository {
  async query(
    ctx: IContext,
    where: Prisma.MembershipWhereInput,
    orderBy: Prisma.MembershipOrderByWithRelationInput[],
    take: number,
    cursor?: Prisma.MembershipUserIdCommunityIdCompoundUniqueInput,
  ) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.membership.findMany({
        where,
        orderBy,
        take: take + 1,
        skip: cursor ? 1 : 0,
        ...(cursor
          ? {
              cursor: {
                userId_communityId: cursor,
              },
            }
          : {}),
        select: membershipSelectDetail,
      });
    });
  }

  async findDetail(ctx: IContext, where: Prisma.MembershipWhereUniqueInput) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.membership.findUnique({
        where,
        select: membershipSelectDetail,
      });
    });
  }

  async find(ctx: IContext, where: Prisma.MembershipWhereUniqueInput) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.membership.findUnique({
        where,
        include: membershipInclude,
      });
    });
  }

  async create(ctx: IContext, data: Prisma.MembershipCreateInput, tx: Prisma.TransactionClient) {
    return tx.membership.create({
      data,
      include: membershipInclude,
    });
  }

  async update(
    ctx: IContext,
    where: Prisma.MembershipWhereUniqueInput,
    data: Prisma.MembershipUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.membership.update({
      where,
      data,
      include: membershipInclude,
    });
  }

  async delete(
    ctx: IContext,
    where: Prisma.MembershipWhereUniqueInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.membership.delete({
      where,
      include: membershipInclude,
    });
  }

  async findFlexible(ctx: IContext, communityId: string, userKey: string) {
    // 1. userIdとして検索
    let membership = await this.find(ctx, { userId_communityId: { userId: userKey, communityId } });
    if (membership) return membership;

    // 2. userNameとして検索
    membership = await ctx.issuer.public(ctx, (tx) =>
      tx.membership.findFirst({
        where: {
          communityId,
          OR: [
            { user: { name: userKey } },
            { userId: userKey }
          ]
        },
        include: membershipInclude
      })
    );
    if (membership) return membership;

    // 3. didIdとして検索
    const didRequest = await ctx.issuer.public(ctx, (tx) =>
      tx.didIssuanceRequest.findFirst({
        where: {
          status: "COMPLETED",
          didValue: { not: null },
          OR: [
            { user: { name: userKey } },
            { id: userKey }
          ]
        },
        include: { user: true }
      })
    );
    if (didRequest?.user) {
      membership = await this.find(ctx, { userId_communityId: { userId: didRequest.user.id, communityId } });
      if (membership) return membership;
    }
    return null;
  }
}
