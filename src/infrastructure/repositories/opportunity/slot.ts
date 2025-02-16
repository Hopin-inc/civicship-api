import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { opportunitySlotInclude } from "@/infrastructure/prisma/types/opportunity/slot";

export default class OpportunitySlotRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
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

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.opportunitySlot.findUnique({
        where: { id },
        include: opportunitySlotInclude,
      });
    });
  }

  static async findByOpportunityId(
    ctx: IContext,
    opportunityId: string,
    tx: Prisma.TransactionClient,
  ) {
    return tx.opportunitySlot.findMany({
      where: { opportunityId },
      include: opportunitySlotInclude,
    });
  }

  static async create(
    ctx: IContext,
    data: Prisma.OpportunitySlotCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.opportunitySlot.create({
      data,
      include: opportunitySlotInclude,
    });
  }

  static async update(
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

  static async delete(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    return tx.opportunitySlot.delete({
      where: { id },
      include: opportunitySlotInclude,
    });
  }
}
