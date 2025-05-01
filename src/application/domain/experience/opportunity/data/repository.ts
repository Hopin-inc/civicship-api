import { Prisma, PublishStatus } from "@prisma/client";
import { opportunityInclude } from "@/application/domain/experience/opportunity/data/type";
import { IContext } from "@/types/server";
import { injectable } from "tsyringe";
import { IOpportunityRepository } from "./interface";

@injectable()
export default class OpportunityRepository implements IOpportunityRepository {
  async query(
    ctx: IContext,
    where: Prisma.OpportunityWhereInput,
    orderBy: Prisma.OpportunityOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.opportunity.findMany({
        where,
        orderBy,
        include: opportunityInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  async find(ctx: IContext, id: string) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.opportunity.findUnique({
        where: { id },
        include: opportunityInclude,
      });
    });
  }

  async findAccessible(
    ctx: IContext,
    where: Prisma.OpportunityWhereUniqueInput & Prisma.OpportunityWhereInput,
  ) {
    return ctx.issuer.public(ctx, (dbTx) => {
      return dbTx.opportunity.findUnique({
        where,
        include: opportunityInclude,
      });
    });
  }

  async create(ctx: IContext, data: Prisma.OpportunityCreateInput, tx: Prisma.TransactionClient) {
    return tx.opportunity.create({
      data,
      include: opportunityInclude,
    });
  }

  async delete(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    return tx.opportunity.delete({
      where: { id },
      include: opportunityInclude,
    });
  }

  async update(
    ctx: IContext,
    id: string,
    data: Prisma.OpportunityUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.opportunity.update({
      where: { id },
      data,
      include: opportunityInclude,
    });
  }

  async setPublishStatus(
    ctx: IContext,
    id: string,
    publishStatus: PublishStatus,
    tx: Prisma.TransactionClient,
  ) {
    return tx.opportunity.update({
      where: { id },
      data: { publishStatus },
      include: opportunityInclude,
    });
  }
}
