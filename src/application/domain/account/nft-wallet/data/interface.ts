import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  PrismaNftWalletDetail,
  PrismaNftWalletCreateDetail,
} from "./type";

export interface INFTWalletRepository {
  query(ctx: IContext): Promise<PrismaNftWalletDetail[]>;
  find(ctx: IContext, id: string): Promise<PrismaNftWalletDetail | null>;
  findByUserId(ctx: IContext, userId: string): Promise<PrismaNftWalletDetail | null>;
  findByUserIdWithTx(ctx: IContext, userId: string, tx: Prisma.TransactionClient): Promise<{ id: string; userId: string; walletAddress: string } | null>;
  create(
    ctx: IContext,
    data: Prisma.NftWalletCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaNftWalletCreateDetail>;
  update(
    ctx: IContext,
    id: string,
    data: Prisma.NftWalletUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaNftWalletDetail>;
  upsertByUserId(
    ctx: IContext,
    userId: string,
    walletAddress: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaNftWalletCreateDetail>;
  upsertNftToken(
    ctx: IContext,
    data: { address: string; name?: string | null; symbol?: string | null; type: string },
    tx: Prisma.TransactionClient,
  ): Promise<{ id: string; address: string }>;
  upsertNftInstance(
    ctx: IContext,
    data: { instanceId: string; name?: string | null; description?: string | null; imageUrl?: string | null; json: any; nftWalletId: string; nftTokenId: string },
    tx: Prisma.TransactionClient,
  ): Promise<{ id: string }>;
}
