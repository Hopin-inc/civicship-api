import { OpportunitySlotHostingStatus, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  PrismaOpportunitySlotDetail,
  PrismaOpportunitySlotReserve,
  PrismaOpportunitySlotSetHostingStatus,
} from "./type";

export interface IOpportunitySlotRepository {
  query(
    ctx: IContext,
    where: Prisma.OpportunitySlotWhereInput,
    orderBy: Prisma.OpportunitySlotOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaOpportunitySlotDetail[]>;

  find(ctx: IContext, id: string): Promise<PrismaOpportunitySlotReserve | null>;

  queryByOpportunityId(
    ctx: IContext,
    where: Prisma.OpportunitySlotWhereInput,
    orderBy?: Prisma.OpportunitySlotOrderByWithRelationInput[],
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
    capacity: number,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaOpportunitySlotSetHostingStatus>;

  deleteMany(
    ctx: IContext,
    ids: string[],
    tx: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload>;
}
