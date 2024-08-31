import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import {
  groupCreateInclude,
  groupGetInclude,
  groupUpdateContentInclude,
} from "@/types/include/group.type";

export default class GroupRepository {
  private static db = prismaClient;

  static async query(
    where: Prisma.GroupWhereInput,
    orderBy: Prisma.GroupOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.db.group.findMany({
      where,
      orderBy,
      include: groupGetInclude,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  static async checkExists(id: string) {
    return this.db.group.findUnique({
      where: { id },
    });
  }

  static async find(id: string) {
    return this.db.group.findUnique({
      where: { id },
      include: groupGetInclude,
    });
  }

  static async findForUpdateContent(id: string) {
    return this.db.group.findUnique({
      where: { id },
      include: groupUpdateContentInclude,
    });
  }

  static async updateContent(id: string, data: Prisma.GroupUpdateInput) {
    return this.db.group.update({
      where: { id },
      data,
      include: groupUpdateContentInclude,
    });
  }

  static async create(data: Prisma.GroupCreateInput) {
    return this.db.group.create({
      data,
      include: groupCreateInclude,
    });
  }

  static async delete(id: string) {
    return this.db.group.delete({ where: { id } });
  }

  static async updateRelation(id: string, data: Prisma.GroupUpdateInput) {
    return this.db.group.update({
      where: { id },
      data: data,
    });
  }
}
