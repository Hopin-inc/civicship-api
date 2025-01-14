import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import { participationStatusHistoryInclude } from "@/domains/opportunity/subdomains/participationStatusHistory/type";

export default class ParticipationStatusHistoryRepository {
  private static db = prismaClient;

  static async query(
    where: Prisma.ParticipationStatusHistoryWhereInput,
    orderBy: Prisma.ParticipationStatusHistoryOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.db.participationStatusHistory.findMany({
      where,
      orderBy,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  static async find(id: string) {
    return this.db.participationStatusHistory.findUnique({
      where: { id },
    });
  }

  static async create(data: Prisma.ParticipationStatusHistoryCreateInput) {
    return this.db.participationStatusHistory.create({
      data,
    });
  }

  static async delete(id: string) {
    return this.db.participationStatusHistory.delete({
      where: { id },
    });
  }

  static async createWithTransaction(
    tx: Prisma.TransactionClient,
    data: Prisma.ParticipationStatusHistoryCreateInput,
  ) {
    return tx.participationStatusHistory.create({
      data,
      include: participationStatusHistoryInclude,
    });
  }
}
