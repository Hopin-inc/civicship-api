import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import {
  PrismaTicketIssuer,
  ticketIssuerInclude,
} from "@/application/domain/reward/ticketIssuer/data/type";
import { ITicketIssuerRepository } from "./interface";

@injectable()
export default class TicketIssuerRepository implements ITicketIssuerRepository {
  async query(
    ctx: IContext,
    where: Prisma.TicketIssuerWhereInput,
    orderBy: Prisma.TicketIssuerOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ): Promise<PrismaTicketIssuer[]> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.ticketIssuer.findMany({
        where,
        orderBy,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        include: ticketIssuerInclude,
      });
    });
  }

  find(ctx: IContext, id: string): Promise<PrismaTicketIssuer | null> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.ticketIssuer.findUnique({
        where: { id },
        include: ticketIssuerInclude,
      });
    });
  }

  create(
    ctx: IContext,
    data: Prisma.TicketIssuerCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTicketIssuer> {
    return tx.ticketIssuer.create({
      data,
      include: ticketIssuerInclude,
    });
  }
}
