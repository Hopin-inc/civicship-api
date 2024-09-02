import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import {
  applicationConfirmationCreateInclude,
  applicationConfirmationGetInclude,
} from "@/domains/applicationConfirmation/type";

export default class ApplicationConfirmationRepository {
  private static db = prismaClient;

  static async query(
    where: Prisma.ApplicationConfirmationWhereInput,
    orderBy: Prisma.ApplicationConfirmationOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ) {
    return this.db.applicationConfirmation.findMany({
      where,
      orderBy,
      include: applicationConfirmationGetInclude,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  static async checkExists(id: string) {
    return this.db.applicationConfirmation.findUnique({
      where: { id },
    });
  }

  static async find(id: string) {
    return this.db.applicationConfirmation.findUnique({
      where: { id },
      include: applicationConfirmationGetInclude,
    });
  }

  static async create(data: Prisma.ApplicationConfirmationCreateInput) {
    return this.db.applicationConfirmation.create({
      data,
      include: applicationConfirmationCreateInclude,
    });
  }

  static async delete(id: string) {
    return this.db.applicationConfirmation.delete({ where: { id } });
  }
}
