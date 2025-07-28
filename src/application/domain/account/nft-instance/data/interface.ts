import { IContext } from "@/types/server";
import { NftInstance, NftToken, NftWallet, Prisma } from "@prisma/client";

export type NftInstanceWithRelations = NftInstance & {
  nftToken?: NftToken | null;
  nftWallet: NftWallet;
};

export default interface INftInstanceRepository {
  findNftInstances(
    ctx: IContext,
    where: Prisma.NftInstanceWhereInput,
    orderBy: Prisma.NftInstanceOrderByWithRelationInput[],
    take: number,
    cursor?: string
  ): Promise<NftInstanceWithRelations[]>;

  findNftInstanceById(ctx: IContext, id: string): Promise<NftInstanceWithRelations | null>;
}
