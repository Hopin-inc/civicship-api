import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import {
  PrismaTicketStatusHistory,
  ticketStatusHistoryInclude,
} from "@/application/domain/reward/ticket/statusHistory/data/type";

export default class TicketStatusHistoryRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.TicketStatusHistoryWhereInput,
    orderBy: Prisma.TicketStatusHistoryOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ): Promise<PrismaTicketStatusHistory[]> {
    return this.issuer.internal(async (tx) => {
      return tx.ticketStatusHistory.findMany({
        where,
        orderBy,
        take: take + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: ticketStatusHistoryInclude,
      });
    });
  }

  static async find(ctx: IContext, id: string): Promise<PrismaTicketStatusHistory | null> {
    return this.issuer.internal(async (tx) => {
      return tx.ticketStatusHistory.findUnique({
        where: { id },
        include: ticketStatusHistoryInclude,
      });
    });
  }
}
