import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { ticketInclude } from "@/application/ticket/data/type";

export default class TicketRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.TicketWhereInput,
    orderBy: Prisma.TicketOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.ticket.findMany({
        where,
        orderBy,
        include: ticketInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.ticket.findUnique({
        where: { id },
        include: ticketInclude,
      });
    });
  }

  static async create(ctx: IContext, data: Prisma.TicketCreateInput) {
    return this.issuer.public(ctx, (tx) => {
      return tx.ticket.create({
        data,
        include: ticketInclude,
      });
    });
  }

  static async delete(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.ticket.delete({
        where: { id },
        include: ticketInclude,
      });
    });
  }

  static async update(ctx: IContext, id: string, data: Prisma.TicketUpdateInput) {
    return this.issuer.public(ctx, (tx) => {
      return tx.ticket.update({
        where: { id },
        data,
        include: ticketInclude,
      });
    });
  }
}
