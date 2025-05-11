import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import {
  ticketClaimLinkInclude,
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
  ) {
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

  async find(ctx: IContext, id: string) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.ticketClaimLink.findUnique({
        where: { id },
        include: ticketClaimLinkInclude,
      });
    });
  }

  async update(
    ctx: IContext,
    id: string,
    data: Prisma.TicketClaimLinkUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.ticketClaimLink.update({
      where: { id },
      data,
      select: ticketClaimLinkSelectDetail,
    });
  }
}
