import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaNftWalletDetail, PrismaNftWalletCreateDetail } from "./type";

export interface INFTWalletRepository {
  findByWalletAddress(ctx: IContext, walletAddress: string): Promise<PrismaNftWalletDetail | null>;
  update(
    ctx: IContext,
    id: string,
    data: Prisma.NftWalletUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaNftWalletDetail>;

  create(
    ctx: IContext,
    data: Prisma.NftWalletCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaNftWalletCreateDetail>;
}
