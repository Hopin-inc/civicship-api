import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";
import INftInstanceRepository from "@/application/domain/account/nft-instance/data/interface";
import { NftInstanceWithRelations } from "@/application/domain/account/nft-instance/data/type";

@injectable()
export default class NftInstanceRepository implements INftInstanceRepository {
  async findNftInstances(
    ctx: IContext,
    where: Prisma.NftInstanceWhereInput,
    orderBy: Prisma.NftInstanceOrderByWithRelationInput[],
    take: number,
    cursor?: string
  ): Promise<NftInstanceWithRelations[]> {
    return ctx.issuer.public(ctx, async (tx) => {
      const result = await tx.nftInstance.findMany({
        where,
        include: {
          nftToken: true,
          nftWallet: true,
        },
        orderBy,
        take,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
      return result as NftInstanceWithRelations[];
    });
  }

  async countNftInstances(
    ctx: IContext,
    where: Prisma.NftInstanceWhereInput
  ): Promise<number> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.nftInstance.count({
        where,
      });
    });
  }

  async findNftInstanceById(ctx: IContext, id: string): Promise<NftInstanceWithRelations | null> {
    return ctx.issuer.public(ctx, async (tx) => {
      const result = await tx.nftInstance.findUnique({
        where: { id },
        include: {
          nftToken: true,
          nftWallet: true,
        },
      });
      return result as NftInstanceWithRelations | null;
    });
  }
}
