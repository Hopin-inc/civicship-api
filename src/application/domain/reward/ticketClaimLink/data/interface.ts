import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { PrismaTicketClaimLinkDetail } from "./type";

export interface ITicketClaimLinkRepository {
  query(
    ctx: IContext,
    where: Prisma.TicketClaimLinkWhereInput,
    orderBy: Prisma.TicketClaimLinkOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ): Promise<PrismaTicketClaimLinkDetail[]>;

  find(ctx: IContext, id: string): Promise<PrismaTicketClaimLinkDetail | null>;

  update(
    ctx: IContext,
    id: string,
    data: Prisma.TicketClaimLinkUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaTicketClaimLinkDetail>;
}

export interface ITicketClaimLinkService {
  findTicketClaimLink(ctx: IContext, id: string): Promise<PrismaTicketClaimLinkDetail | null>;
  findTicketClaimLinkOrThrow(ctx: IContext, id: string): Promise<PrismaTicketClaimLinkDetail>;
  validateBeforeClaim(ctx: IContext, id: string): Promise<PrismaTicketClaimLinkDetail>;
  markAsClaimed(
    ctx: IContext,
    claimLinkId: string,
    qty: number,
    tx: Prisma.TransactionClient,
  ): Promise<void>;
}
