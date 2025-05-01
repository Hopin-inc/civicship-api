import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { membershipInclude } from "@/application/domain/account/membership/data/type";
import { IMembershipRepository } from "@/application/domain/account/membership/data/interface";
import { inject, injectable } from "tsyringe";

@injectable()
export default class MembershipRepository implements IMembershipRepository {
  constructor(@inject("PrismaClientIssuer") private readonly issuer: PrismaClientIssuer) {}

  async query(
    ctx: IContext,
    where: Prisma.MembershipWhereInput,
    orderBy: Prisma.MembershipOrderByWithRelationInput[],
    take: number,
    cursor?: Prisma.MembershipUserIdCommunityIdCompoundUniqueInput,
  ) {
    return this.issuer.public(ctx, (tx) => {
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
        include: membershipInclude,
      });
    });
  }

  async find(ctx: IContext, where: Prisma.MembershipWhereUniqueInput) {
    return this.issuer.public(ctx, (tx) => {
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
