import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import {
  PrismaTicketStatusHistoryDetail,
  ticketStatusHistorySelectDetail,
} from "@/application/domain/reward/ticket/statusHistory/data/type";

export default class TicketStatusHistoryRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.TicketStatusHistoryWhereInput,
    orderBy: Prisma.TicketStatusHistoryOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ): Promise<PrismaTicketStatusHistoryDetail[]> {
    return this.issuer.internal(async (tx) => {
      return tx.ticketStatusHistory.findMany({
        where,
        orderBy,
        take: take + 1,
        cursor: cursor ? { id: cursor } : undefined,
        select: ticketStatusHistorySelectDetail,
      });
    });
  }

  static async find(ctx: IContext, id: string): Promise<PrismaTicketStatusHistoryDetail | null> {
    return this.issuer.internal(async (tx) => {
      return tx.ticketStatusHistory.findUnique({
        where: { id },
        select: ticketStatusHistorySelectDetail,
      });
    });
  }
}
