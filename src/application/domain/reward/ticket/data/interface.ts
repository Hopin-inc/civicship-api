import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { PrismaTicketDetail } from "@/application/domain/reward/ticket/data/type";

export interface ITicketRepository {
  query(
    ctx: IContext,
    where: Prisma.TicketWhereInput,
    orderBy: Prisma.TicketOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ): Promise<PrismaTicketDetail[]>;

  queryByIds(ctx: IContext, ids: string[]): Promise<PrismaTicketDetail[]>;

  find(ctx: IContext, id: string): Promise<PrismaTicketDetail | null>;

  create(
    ctx: IContext,
    data: Prisma.TicketCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTicketDetail>;

  delete(ctx: IContext, id: string): Promise<PrismaTicketDetail>;

  update(
    ctx: IContext,
    id: string,
    data: Prisma.TicketUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTicketDetail>;
}
