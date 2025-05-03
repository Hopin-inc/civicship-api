import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import {
  PrismaTicketClaimLinkDetail,
  ticketClaimLinkSelectDetail,
} from "@/application/domain/reward/ticketClaimLink/data/type";
import { ITicketClaimLinkRepository } from "./interface";

@injectable()
export default class TicketClaimLinkRepository implements ITicketClaimLinkRepository {
  async query(
    ctx: IContext,
    where: Prisma.TicketClaimLinkWhereInput,
    orderBy: Prisma.TicketClaimLinkOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ): Promise<PrismaTicketClaimLinkDetail[]> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.ticketClaimLink.findMany({
        where,
        orderBy,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        select: ticketClaimLinkSelectDetail,
      });
    });
  }

  async find(ctx: IContext, id: string): Promise<PrismaTicketClaimLinkDetail | null> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.ticketClaimLink.findUnique({
        where: { id },
        select: ticketClaimLinkSelectDetail,
      });
    });
  }

  async update(
    ctx: IContext,
    id: string,
    data: Prisma.TicketClaimLinkUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTicketClaimLinkDetail> {
    return tx.ticketClaimLink.update({
      where: { id },
      data,
      select: ticketClaimLinkSelectDetail,
    });
  }
}
