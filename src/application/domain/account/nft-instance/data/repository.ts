import { IContext } from "@/types/server";
import { injectable } from "tsyringe";
import INftInstanceRepository from "@/application/domain/account/nft-instance/data/interface";

@injectable()
export default class NftInstanceRepository implements INftInstanceRepository {
  async findNftInstances(
    ctx: IContext,
    where: any,
    orderBy: any[],
    take: number,
    cursor?: string
  ): Promise<any[]> {
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

  async findNftInstanceById(ctx: IContext, id: string): Promise<any | null> {
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
