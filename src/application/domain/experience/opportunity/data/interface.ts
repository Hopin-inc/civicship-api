import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaOpportunity } from "./type";

export interface IOpportunityRepository {
  query(
    ctx: IContext,
    where: Prisma.OpportunityWhereInput,
    orderBy: Prisma.OpportunityOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaOpportunity[]>;

  find(ctx: IContext, id: string): Promise<PrismaOpportunity | null>;

  create(
    ctx: IContext,
    data: Prisma.OpportunityCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaOpportunity>;

  update(
    ctx: IContext,
    id: string,
    data: Prisma.OpportunityUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaOpportunity>;

  delete(ctx: IContext, id: string, tx: Prisma.TransactionClient): Promise<PrismaOpportunity>;
}