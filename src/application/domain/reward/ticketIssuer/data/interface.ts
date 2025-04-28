import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { PrismaTicketIssuer } from "./type";

export interface ITicketIssuerRepository {
  find(ctx: IContext, id: string): Promise<PrismaTicketIssuer | null>;
  create(
    ctx: IContext,
    data: Prisma.TicketIssuerCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTicketIssuer>;
}

export interface ITicketIssuerService {
  issueTicket(
    ctx: IContext,
    userId: string,
    utilityId: string,
    qtyToBeIssued: number,
  ): Promise<PrismaTicketIssuer>;
} 