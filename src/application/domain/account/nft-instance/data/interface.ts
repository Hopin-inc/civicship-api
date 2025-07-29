import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { NftInstanceWithRelations } from "@/application/domain/account/nft-instance/data/type";

export default interface INftInstanceRepository {
  query(
    ctx: IContext,
    where: Prisma.NftInstanceWhereInput,
    orderBy: Prisma.NftInstanceOrderByWithRelationInput[],
    take: number,
    cursor?: string
  ): Promise<NftInstanceWithRelations[]>;

  findNftInstanceById(ctx: IContext, id: string): Promise<NftInstanceWithRelations | null>;

  countNftInstances(
    ctx: IContext,
    where: Prisma.NftInstanceWhereInput
  ): Promise<number>;
}
