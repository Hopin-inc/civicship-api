import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  membershipInclude,
  membershipSelectDetail,
  PrismaMembershipDetail,
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
  ): Promise<PrismaMembershipDetail[]> {
    return ctx.issuer.onlyBelongingCommunity(ctx, (tx) => {
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

  async find(ctx: IContext, where: Prisma.MembershipWhereUniqueInput, tx?: Prisma.TransactionClient) {
    if (tx) {
      return tx.membership.findUnique({
        where,
        include: membershipInclude,
      });
    }
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
}
