import { OpportunitySlotHostingStatus, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  opportunitySlotSelectDetail,
  opportunitySlotWithParticipationSelectDetail,
  PrismaOpportunitySlotDetail,
  PrismaOpportunitySlotWithParticipationDetail
} from "@/application/domain/experience/opportunitySlot/data/type";
import { injectable } from "tsyringe";
import { IOpportunitySlotRepository } from "./interface";

@injectable()
export default class OpportunitySlotRepository implements IOpportunitySlotRepository {
  async query(
    ctx: IContext,
    where: Prisma.OpportunitySlotWhereInput,
    orderBy: Prisma.OpportunitySlotOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaOpportunitySlotDetail[]> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.opportunitySlot.findMany({
        where,
        orderBy,
        select: opportunitySlotSelectDetail,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  async find(ctx: IContext, id: string): Promise<PrismaOpportunitySlotDetail | null> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.opportunitySlot.findUnique({
        where: { id },
        select: opportunitySlotSelectDetail,
      });
    });
  }

  async findByOpportunityId(ctx: IContext, opportunityId: string): Promise<PrismaOpportunitySlotDetail[]> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.opportunitySlot.findMany({
        where: { opportunityId },
        select: opportunitySlotSelectDetail,
      });
    });
  }

  async createMany(
    ctx: IContext,
    data: Prisma.OpportunitySlotCreateManyInput[],
    tx: Prisma.TransactionClient,
  ) {
    return tx.opportunitySlot.createMany({ data });
  }

  async update(
    ctx: IContext,
    id: string,
    data: Prisma.OpportunitySlotUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaOpportunitySlotDetail> {
    return tx.opportunitySlot.update({
      where: { id },
      data,
      select: opportunitySlotSelectDetail,
    });
  }

  async setHostingStatus(
    ctx: IContext,
    id: string,
    hostingStatus: OpportunitySlotHostingStatus,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaOpportunitySlotWithParticipationDetail> {
    return tx.opportunitySlot.update({
      where: { id },
      data: { hostingStatus },
      select: opportunitySlotWithParticipationSelectDetail,
    });
  }

  async deleteMany(ctx: IContext, ids: string[], tx: Prisma.TransactionClient) {
    return tx.opportunitySlot.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
