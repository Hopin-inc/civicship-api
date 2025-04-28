import { Prisma } from "@prisma/client";
import { PrismaCommunity } from "@/application/domain/account/community/data/type";
import { IContext } from "@/types/server";

export interface ICommunityRepository {
  query(
    ctx: IContext,
    where: Prisma.CommunityWhereInput,
    orderBy: Prisma.CommunityOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaCommunity[]>;

  find(ctx: IContext, id: string): Promise<PrismaCommunity | null>;

  create(
    ctx: IContext,
    data: Prisma.CommunityCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaCommunity>;

  update(
    ctx: IContext,
    id: string,
    data: Prisma.CommunityUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaCommunity>;

  delete(ctx: IContext, id: string, tx: Prisma.TransactionClient): Promise<PrismaCommunity>;
}
