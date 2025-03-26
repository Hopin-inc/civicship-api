import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { ticketInclude } from "@/application/domain/ticket/data/type";

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

  static async queryByIds(ctx: IContext, ids: string[]) {
    return this.issuer.public(ctx, (tx) => {
      return tx.ticket.findMany({
        where: { id: { in: ids } },
        include: ticketInclude,
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

  static async create(ctx: IContext, data: Prisma.TicketCreateInput, tx: Prisma.TransactionClient) {
    return tx.ticket.create({
      data,
      include: ticketInclude,
    });
  }

  static async createMany(
    ctx: IContext,
    data: Prisma.TicketCreateManyInput[],
    tx: Prisma.TransactionClient,
  ) {
    return tx.ticket.createMany({
      data,
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

  static async update(
    ctx: IContext,
    id: string,
    data: Prisma.TicketUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.ticket.update({
        where: { id },
        data,
        include: ticketInclude,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) => {
        return dbTx.ticket.update({
          where: { id },
          data,
          include: ticketInclude,
        });
      });
    }
  }
}
