import { Prisma } from "@prisma/client";

export const nftWalletSelectDetail = {
  id: true,
  userId: true,
  walletAddress: true,
  type: true,

  createdAt: true,
  updatedAt: true,
};

export type PrismaNftWalletDetail = Prisma.NftWalletGetPayload<{
  select: typeof nftWalletSelectDetail;
}>;

export const nftWalletCreateSelect = {
  id: true,
  userId: true,
  walletAddress: true,
  type: true,

  createdAt: true,
  updatedAt: true,
};

export type PrismaNftWalletCreateDetail = Prisma.NftWalletGetPayload<{
  select: typeof nftWalletCreateSelect;
}>;
