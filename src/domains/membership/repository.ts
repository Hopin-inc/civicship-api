import { PrismaClientIssuer } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { membershipInclude } from "@/domains/membership/type";

export default class MembershipRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
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

  static async find(
    ctx: IContext,
    where: Prisma.MembershipWhereUniqueInput,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.membership.findUnique({
        where,
        include: membershipInclude,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) => {
        return dbTx.membership.findUnique({
          where,
          include: membershipInclude,
        });
      });
    }
  }

  static async create(
    ctx: IContext,
    data: Prisma.MembershipCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.membership.create({
        data,
        include: membershipInclude,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) => {
        return dbTx.membership.create({
          data,
          include: membershipInclude,
        });
      });
    }
  }

  static async setStatus(
    ctx: IContext,
    where: Prisma.MembershipWhereUniqueInput,
    status: Prisma.EnumMembershipStatusFieldUpdateOperationsInput,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.membership.update({
        where,
        data: { status },
        include: membershipInclude,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) => {
        return dbTx.membership.update({
          where,
          data: { status },
          include: membershipInclude,
        });
      });
    }
  }

  static async setRole(
    ctx: IContext,
    where: Prisma.MembershipWhereUniqueInput,
    role: Prisma.EnumRoleFieldUpdateOperationsInput,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.membership.update({
        where,
        data: { role },
        include: membershipInclude,
      });
    });
  }

  static async update(
    ctx: IContext,
    where: Prisma.MembershipWhereUniqueInput,
    data: Prisma.MembershipUpdateInput,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.membership.update({
        where,
        data,
        include: membershipInclude,
      });
    });
  }

  static async delete(ctx: IContext, where: Prisma.MembershipWhereUniqueInput) {
    return this.issuer.public(ctx, (tx) => {
      return tx.membership.delete({
        where,
        include: membershipInclude,
      });
    });
  }
}
