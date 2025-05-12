import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { PrismaTicketIssuerDetail } from "./type";

export interface ITicketIssuerRepository {
  find(ctx: IContext, id: string): Promise<PrismaTicketIssuerDetail | null>;
  create(
    ctx: IContext,
    data: Prisma.TicketIssuerCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTicketIssuerDetail>;
}

export interface ITicketIssuerService {
  issueTicket(
    ctx: IContext,
    userId: string,
    utilityId: string,
    qtyToBeIssued: number,
  ): Promise<PrismaTicketIssuerDetail>;
}
