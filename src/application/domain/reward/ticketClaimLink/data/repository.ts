import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import {
  PrismaTicketClaimLink,
  ticketClaimLinkInclude,
} from "@/application/domain/reward/ticketClaimLink/data/type";
import { ITicketClaimLinkRepository } from "./interface";

@injectable()
export default class TicketClaimLinkRepository implements ITicketClaimLinkRepository {
  constructor(
    @inject("PrismaClientIssuer") private readonly issuer: PrismaClientIssuer,
  ) { }

  async query(
    ctx: IContext,
    where: Prisma.TicketClaimLinkWhereInput,
    orderBy: Prisma.TicketClaimLinkOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ): Promise<PrismaTicketClaimLink[]> {
    return this.issuer.public(ctx, (tx) => {
      return tx.ticketClaimLink.findMany({
        where,
        orderBy,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        include: ticketClaimLinkInclude,
      });
    });
  }

  async find(ctx: IContext, id: string): Promise<PrismaTicketClaimLink | null> {
    return this.issuer.public(ctx, (tx) => {
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
  ): Promise<PrismaTicketClaimLink> {
    return tx.ticketClaimLink.update({
      where: { id },
      data,
      include: ticketClaimLinkInclude,
    });
  }
}
