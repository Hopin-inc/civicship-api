import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { PrismaTicket } from "@/application/domain/reward/ticket/data/type";

export interface ITicketRepository {
  query(
    ctx: IContext,
    where: Prisma.TicketWhereInput,
    orderBy: Prisma.TicketOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ): Promise<PrismaTicket[]>;

  queryByIds(ctx: IContext, ids: string[]): Promise<PrismaTicket[]>;

  find(ctx: IContext, id: string): Promise<PrismaTicket | null>;

  create(
    ctx: IContext,
    data: Prisma.TicketCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTicket>;

  delete(ctx: IContext, id: string): Promise<PrismaTicket>;

  update(
    ctx: IContext,
    id: string,
    data: Prisma.TicketUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTicket>;
}
