import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaOpportunityDetail } from "./type";

export interface IOpportunityRepository {
  query(
    ctx: IContext,
    where: Prisma.OpportunityWhereInput,
    orderBy: Prisma.OpportunityOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaOpportunityDetail[]>;

  find(ctx: IContext, id: string): Promise<PrismaOpportunityDetail | null>;

  create(
    ctx: IContext,
    data: Prisma.OpportunityCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaOpportunityDetail>;

  update(
    ctx: IContext,
    id: string,
    data: Prisma.OpportunityUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaOpportunityDetail>;

  delete(ctx: IContext, id: string, tx: Prisma.TransactionClient): Promise<PrismaOpportunityDetail>;
}
