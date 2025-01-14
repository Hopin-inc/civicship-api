import { prismaClient } from "@/prisma/client";
import { ParticipationStatus, Prisma } from "@prisma/client";
import { participationInclude } from "@/domains/opportunity/subdomains/paricipation/type";

export default class ParticipationRepository {
  private static db = prismaClient;

  static async query(
    where: Prisma.ParticipationWhereInput,
    orderBy: Prisma.ParticipationOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.db.participation.findMany({
      where,
      orderBy,
      include: participationInclude,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  static async find(id: string) {
    return this.db.participation.findUnique({
      where: { id },
      include: participationInclude,
    });
  }

  static async create(data: Prisma.ParticipationCreateInput) {
    return this.db.participation.create({
      data,
      include: participationInclude,
    });
  }

  static async update(id: string, data: Prisma.ParticipationUpdateInput) {
    return this.db.participation.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return this.db.participation.delete({
      where: { id },
    });
  }

  static async createWithTransaction(
    tx: Prisma.TransactionClient,
    data: Prisma.ParticipationCreateInput,
  ) {
    return tx.participation.create({ data, include: participationInclude });
  }

  static async updateStatusWithTransaction(
    tx: Prisma.TransactionClient,
    id: string,
    status: ParticipationStatus,
  ) {
    return tx.participation.update({
      where: { id },
      data: { status },
      include: participationInclude,
    });
  }
}
