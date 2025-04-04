import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma, PublishStatus } from "@prisma/client";
import { opportunityInclude, PrismaOpportunity } from "@/application/domain/opportunity/data/type";
import { IContext } from "@/types/server";

export default class OpportunityRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.OpportunityWhereInput,
    orderBy: Prisma.OpportunityOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaOpportunity[]> {
    return this.issuer.public(ctx, (tx) => {
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

  static async find(ctx: IContext, id: string, tx?: Prisma.TransactionClient) {
    if (tx) {
      return tx.opportunity.findUnique({
        where: { id },
        include: opportunityInclude,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) => {
        return dbTx.opportunity.findUnique({
          where: { id },
          include: opportunityInclude,
        });
      });
    }
  }

  static async findAccessible(
    ctx: IContext,
    where: Prisma.OpportunityWhereUniqueInput & Prisma.OpportunityWhereInput,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.opportunity.findUnique({
        where,
        include: opportunityInclude,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) => {
        return dbTx.opportunity.findUnique({
          where,
          include: opportunityInclude,
        });
      });
    }
  }

  static async create(ctx: IContext, data: Prisma.OpportunityCreateInput) {
    return this.issuer.public(ctx, (tx) => {
      return tx.opportunity.create({
        data,
        include: opportunityInclude,
      });
    });
  }

  static async delete(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.opportunity.delete({
        where: { id },
        include: opportunityInclude,
      });
    });
  }

  static async update(ctx: IContext, id: string, data: Prisma.OpportunityUpdateInput) {
    return this.issuer.public(ctx, (tx) => {
      return tx.opportunity.update({
        where: { id },
        data,
        include: opportunityInclude,
      });
    });
  }

  static async setPublishStatus(ctx: IContext, id: string, publishStatus: PublishStatus) {
    return this.issuer.public(ctx, (tx) => {
      return tx.opportunity.update({
        where: { id },
        data: { publishStatus },
        include: opportunityInclude,
      });
    });
  }
}
