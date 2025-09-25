import { Prisma } from "@prisma/client";

export const nftMintSelectBase = Prisma.validator<Prisma.NftMintSelect>()({
  id: true,

  txHash: true,
  status: true,
  error: true,

  orderItem: true,
  nftWallet: true,

  createdAt: true,
  updatedAt: true,
});

export type PrismaNftMint = Prisma.NftMintGetPayload<{ select: typeof nftMintSelectBase }>;
