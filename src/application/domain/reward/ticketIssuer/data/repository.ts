import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import {
  PrismaTicketIssuer,
  PrismaTicketIssuerDetail,
  ticketIssuerInclude,
  ticketIssuerSelectDetail,
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
  ): Promise<PrismaTicketIssuerDetail[]> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.ticketIssuer.findMany({
        where,
        orderBy,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        select: ticketIssuerSelectDetail,
      });
    });
  }

  find(ctx: IContext, id: string): Promise<PrismaTicketIssuerDetail | null> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.ticketIssuer.findUnique({
        where: { id },
        select: ticketIssuerSelectDetail,
      });
    });
  }

  create(
    ctx: IContext,
    data: Prisma.TicketIssuerCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTicketIssuerDetail> {
    return tx.ticketIssuer.create({
      data,
      select: ticketIssuerSelectDetail,
    });
  }
}
