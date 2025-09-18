import { NftMintStatus, Prisma } from "@prisma/client";

export const nftMintSelectBase = Prisma.validator<Prisma.NftMintSelect>()({
  id: true,

  sequenceNum: true,
  txHash: true,
  status: true,
  error: true,

  orderItem: true,
  nftWallet: true,

  createdAt: true,
  updatedAt: true,
});

export type PrismaNftMint = Prisma.NftMintGetPayload<{ select: typeof nftMintSelectBase }>;

export interface NftMintResult {
  mintId: string;
  status: NftMintStatus;
  txHash?: string;
  error?: string;
}

export interface RequestNftMintResponse {
  success: boolean;
  orderItemId: string;
  results: NftMintResult[];
}
