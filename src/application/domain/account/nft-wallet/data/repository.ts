import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { injectable } from "tsyringe";
import { INFTWalletRepository } from "@/application/domain/account/nft-wallet/data/interface";
import {
  nftWalletSelectDetail,
  nftWalletCreateSelect,
} from "@/application/domain/account/nft-wallet/data/type";

@injectable()
export default class NFTWalletRepository implements INFTWalletRepository {
  async findByWalletAddress(ctx: IContext, walletAddress: string) {
    return ctx.issuer.public(ctx, (client) =>
      client.nftWallet.findUnique({
        where: { walletAddress },
        select: nftWalletSelectDetail,
      }),
    );
  }

  async update(
    ctx: IContext,
    id: string,
    data: Prisma.NftWalletUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.nftWallet.update({
      where: { id },
      data,
      select: nftWalletSelectDetail,
    });
  }

  async create(ctx: IContext, data: Prisma.NftWalletCreateInput, tx: Prisma.TransactionClient) {
    return tx.nftWallet.create({
      data,
      select: nftWalletCreateSelect,
    });
  }
}
