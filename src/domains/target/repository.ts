import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import { targetDefaultInclude } from "@/domains/target/type";

export default class TargetRepository {
  private static db = prismaClient;

  static async query(
    where: Prisma.TargetWhereInput,
    orderBy: Prisma.TargetOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ) {
    return this.db.target.findMany({
      where,
      orderBy,
      include: targetDefaultInclude,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  static async checkExists(id: string) {
    return this.db.target.findUnique({
      where: { id },
    });
  }

  static async find(id: string) {
    return this.db.target.findUnique({
      where: { id },
      include: targetDefaultInclude,
    });
  }

  static async findForUpdateContent(id: string) {
    return this.db.target.findUnique({
      where: { id },
      include: targetDefaultInclude,
    });
  }

  static async create(data: Prisma.TargetCreateInput) {
    return this.db.target.create({
      data,
      include: targetDefaultInclude,
    });
  }

  static async delete(id: string) {
    return this.db.target.delete({ where: { id } });
  }

  static async updateContent(id: string, data: Prisma.TargetUpdateInput) {
    return this.db.target.update({
      where: { id },
      data,
      include: targetDefaultInclude,
    });
  }

  static async updateRelation(id: string, data: Prisma.TargetUpdateInput) {
    return this.db.target.update({
      where: { id },
      data: data,
    });
  }
}
