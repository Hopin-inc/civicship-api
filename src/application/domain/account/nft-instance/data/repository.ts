import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";
import INftInstanceRepository, { NftInstanceWithRelations } from "@/application/domain/account/nft-instance/data/interface";

@injectable()
export default class NftInstanceRepository implements INftInstanceRepository {
  async findNftInstances(
    ctx: IContext,
    where: Prisma.NftInstanceWhereInput,
    orderBy: Prisma.NftInstanceOrderByWithRelationInput[],
    take: number,
    cursor?: string
  ): Promise<NftInstanceWithRelations[]> {
    return ctx.issuer.public(ctx, (tx) => {
      return (tx as any).nftInstance.findMany({
        where: {
          ...where,
          ...(cursor ? { id: { gt: cursor } } : {}),
        },
        include: {
          nftToken: true,
          nftWallet: true,
        },
        orderBy,
        take,
      });
    });
  }

  async findNftInstanceById(ctx: IContext, id: string): Promise<NftInstanceWithRelations | null> {
    return ctx.issuer.public(ctx, (tx) => {
      return (tx as any).nftInstance.findUnique({
        where: { id },
        include: {
          nftToken: true,
          nftWallet: true,
        },
      });
    });
  }
}
