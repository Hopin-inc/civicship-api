import { OpportunitySlotHostingStatus, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaOpportunitySlotDetail } from "./type";

export interface IOpportunitySlotRepository {
  query(
    ctx: IContext,
    where: Prisma.OpportunitySlotWhereInput,
    orderBy: Prisma.OpportunitySlotOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaOpportunitySlotDetail[]>;

  find(ctx: IContext, id: string): Promise<PrismaOpportunitySlotDetail | null>;

  findByOpportunityId(
    ctx: IContext,
    opportunityId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaOpportunitySlotDetail[]>;

  createMany(
    ctx: IContext,
    data: Prisma.OpportunitySlotCreateManyInput[],
    tx: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload>;

  update(
    ctx: IContext,
    id: string,
    data: Prisma.OpportunitySlotUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaOpportunitySlotDetail>;

  setHostingStatus(
    ctx: IContext,
    id: string,
    hostingStatus: OpportunitySlotHostingStatus,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaOpportunitySlotDetail>;

  deleteMany(
    ctx: IContext,
    ids: string[],
    tx: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload>;
}
