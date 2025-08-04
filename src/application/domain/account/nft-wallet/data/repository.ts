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
  async query(ctx: IContext) {
    return ctx.issuer.public(ctx, (client) => {
      return client.nftWallet.findMany({
        select: nftWalletSelectDetail,
      });
    });
  }

  async find(ctx: IContext, id: string) {
    return ctx.issuer.public(ctx, (client) => {
      return client.nftWallet.findUnique({
        where: { id },
        select: nftWalletSelectDetail,
      });
    });
  }

  async findByUserId(ctx: IContext, userId: string) {
    return ctx.issuer.public(ctx, (client) => {
      return client.nftWallet.findUnique({
        where: { userId },
        select: nftWalletSelectDetail,
      });
    });
  }

  async create(ctx: IContext, data: Prisma.NftWalletCreateInput, tx: Prisma.TransactionClient) {
    return tx.nftWallet.create({
      data,
      select: nftWalletCreateSelect,
    });
  }

  async update(ctx: IContext, id: string, data: Prisma.NftWalletUpdateInput, tx: Prisma.TransactionClient) {
    return tx.nftWallet.update({
      where: { id },
      data,
      select: nftWalletSelectDetail,
    });
  }

  async upsertByUserId(ctx: IContext, userId: string, walletAddress: string, tx: Prisma.TransactionClient) {
    return tx.nftWallet.upsert({
      where: { userId },
      update: { walletAddress },
      create: {
        userId,
        walletAddress,
      },
      select: nftWalletCreateSelect,
    });
  }

  async findByUserIdWithTx(ctx: IContext, userId: string, tx: Prisma.TransactionClient) {
    return tx.nftWallet.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        walletAddress: true,
      },
    });
  }

}
