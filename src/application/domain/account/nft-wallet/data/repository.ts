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

  async upsertNftToken(ctx: IContext, data: { address: string; name?: string | null; symbol?: string | null; type: string }, tx: Prisma.TransactionClient) {
    return tx.nftToken.upsert({
      where: { address: data.address },
      update: {
        name: data.name,
        symbol: data.symbol,
        type: data.type,
      },
      create: {
        address: data.address,
        name: data.name ?? null,
        symbol: data.symbol ?? null,
        type: data.type,
      },
      select: {
        id: true,
        address: true,
      },
    });
  }

  async upsertNftInstance(ctx: IContext, data: { instanceId: string; name?: string | null; description?: string | null; imageUrl?: string | null; json: any; nftWalletId: string; nftTokenId: string }, tx: Prisma.TransactionClient) {
    return tx.nftInstance.upsert({
      where: {
        nftWalletId_instanceId: {
          nftWalletId: data.nftWalletId,
          instanceId: data.instanceId,
        },
      },
      update: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        json: data.json,
        nftTokenId: data.nftTokenId,
      },
      create: {
        instanceId: data.instanceId,
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        json: data.json,
        nftWalletId: data.nftWalletId,
        nftTokenId: data.nftTokenId,
      },
      select: {
        id: true,
      },
    });
  }
}
