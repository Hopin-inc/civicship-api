import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { ticketInclude } from "@/application/domain/reward/ticket/data/type";
import { injectable } from "tsyringe";
import { ITicketRepository } from "@/application/domain/reward/ticket/data/interface";

@injectable()
export default class TicketRepository implements ITicketRepository {
  async query(
    ctx: IContext,
    where: Prisma.TicketWhereInput,
    orderBy: Prisma.TicketOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ) {
    return ctx.issuer.public(ctx, (tx) => {
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

  async queryByIds(ctx: IContext, ids: string[]) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.ticket.findMany({
        where: { id: { in: ids } },
        include: ticketInclude,
      });
    });
  }

  async find(ctx: IContext, id: string) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.ticket.findUnique({
        where: { id },
        include: ticketInclude,
      });
    });
  }

  async create(ctx: IContext, data: Prisma.TicketCreateInput, tx: Prisma.TransactionClient) {
    return tx.ticket.create({
      data,
      include: ticketInclude,
    });
  }

  async delete(ctx: IContext, id: string) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.ticket.delete({
        where: { id },
        include: ticketInclude,
      });
    });
  }

  async update(
    ctx: IContext,
    id: string,
    data: Prisma.TicketUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.ticket.update({
      where: { id },
      data,
      include: ticketInclude,
    });
  }
}
