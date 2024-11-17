import { prismaClient, PrismaClientIssuer } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import { userCreateInclude, userGetInclude, userUpdateContentInclude } from "@/domains/user/type";
import { IContext } from "@/types/server";

export default class UserRepository {
  private static db = prismaClient;
  private static issuer = new PrismaClientIssuer();

  static async query(
    where: Prisma.UserWhereInput,
    orderBy: Prisma.UserOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ) {
    return this.db.user.findMany({
      where,
      orderBy,
      include: userGetInclude,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  static async queryOnlyOrganization(
    ctx: IContext,
    where: Prisma.UserWhereInput,
    orderBy: Prisma.UserOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ) {
    return this.issuer.onlyBelongingOrganization(ctx, tx => {
      return tx.user.findMany({
        where,
        orderBy,
        include: userGetInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  static async checkExists(id: string) {
    return this.db.user.findUnique({
      where: { id },
    });
  }

  static async find(id: string) {
    return this.db.user.findUnique({
      where: { id },
      include: userGetInclude,
    });
  }

  static async findForUpdateContent(id: string) {
    return this.db.user.findUnique({
      where: { id },
      include: userUpdateContentInclude,
    });
  }

  static async updateContent(id: string, data: Prisma.UserUpdateInput) {
    return this.db.user.update({
      where: { id },
      data,
      include: userUpdateContentInclude,
    });
  }

  static async switchPrivacy(id: string, isPublic: boolean) {
    return this.db.user.update({
      where: { id },
      data: { isPublic: isPublic },
    });
  }

  static async create(data: Prisma.UserCreateInput) {
    return this.db.user.create({
      data,
      include: userCreateInclude,
    });
  }

  static async createWithIdentity(data: Prisma.UserCreateInput) {
    return this.db.user.create({
      data,
      include: {
        identities: true,
      },
    });
  }

  static async delete(id: string) {
    return this.db.user.delete({ where: { id } });
  }

  static async deleteWithIdentity(id: string) {
    return this.db.user.delete({
      where: { id },
      include: {
        identities: true,
      },
    });
  }

  static async updateRelation(id: string, data: Prisma.UserUpdateInput) {
    return this.db.user.update({
      where: { id },
      data: data,
    });
  }
}
