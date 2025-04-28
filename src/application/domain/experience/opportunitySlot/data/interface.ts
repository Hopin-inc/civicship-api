import { OpportunitySlotHostingStatus, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaOpportunitySlot } from "./type";

export interface IOpportunitySlotRepository {
  query(
    ctx: IContext,
    where: Prisma.OpportunitySlotWhereInput,
    orderBy: Prisma.OpportunitySlotOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaOpportunitySlot[]>;

  find(ctx: IContext, id: string): Promise<PrismaOpportunitySlot | null>;

  findByOpportunityId(
    ctx: IContext,
    opportunityId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaOpportunitySlot[]>;

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
  ): Promise<PrismaOpportunitySlot>;

  setHostingStatus(
    ctx: IContext,
    id: string,
    hostingStatus: OpportunitySlotHostingStatus,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaOpportunitySlot>;

  deleteMany(ctx: IContext, ids: string[], tx: Prisma.TransactionClient): Promise<Prisma.BatchPayload>;
}