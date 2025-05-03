import { Prisma } from "@prisma/client";
import { PrismaCommunityDetail } from "@/application/domain/account/community/data/type";
import { IContext } from "@/types/server";

export default interface ICommunityRepository {
  query(
    ctx: IContext,
    where: Prisma.CommunityWhereInput,
    orderBy: Prisma.CommunityOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaCommunityDetail[]>;

  find(ctx: IContext, id: string): Promise<PrismaCommunityDetail | null>;

  create(
    ctx: IContext,
    data: Prisma.CommunityCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaCommunityDetail>;

  update(
    ctx: IContext,
    id: string,
    data: Prisma.CommunityUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaCommunityDetail>;

  delete(ctx: IContext, id: string, tx: Prisma.TransactionClient): Promise<PrismaCommunityDetail>;
}
