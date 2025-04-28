import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { OpportunitySlotHostingStatus, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  opportunitySlotInclude,
  opportunitySlotWithParticipationInclude,
} from "@/application/domain/experience/opportunitySlot/data/type";
import { inject, injectable } from "tsyringe";
import { IOpportunitySlotRepository } from "./interface";

@injectable()
export default class OpportunitySlotRepository implements IOpportunitySlotRepository {
  constructor(
    @inject("PrismaClientIssuer") private readonly issuer: PrismaClientIssuer,
  ) { }

  async query(
    ctx: IContext,
    where: Prisma.OpportunitySlotWhereInput,
    orderBy: Prisma.OpportunitySlotOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.opportunitySlot.findMany({
        where,
        orderBy,
        include: opportunitySlotInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.opportunitySlot.findUnique({
        where: { id },
        include: opportunitySlotInclude,
      });
    });
  }

  async findByOpportunityId(
    ctx: IContext,
    opportunityId: string,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.opportunitySlot.findMany({
        where: { opportunityId },
        include: opportunitySlotInclude,
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
  ) {
    return tx.opportunitySlot.update({
      where: { id },
      data,
      include: opportunitySlotInclude,
    });
  }

  async setHostingStatus(
    ctx: IContext,
    id: string,
    hostingStatus: OpportunitySlotHostingStatus,
    tx: Prisma.TransactionClient,
  ) {
    return tx.opportunitySlot.update({
      where: { id },
      data: { hostingStatus },
      include: opportunitySlotWithParticipationInclude,
    });
  }

  async deleteMany(ctx: IContext, ids: string[], tx: Prisma.TransactionClient) {
    return tx.opportunitySlot.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
