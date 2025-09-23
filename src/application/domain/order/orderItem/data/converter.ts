import { Prisma } from "@prisma/client";

export const ORDER_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  CANCELED: "CANCELED",
  REFUNDED: "REFUNDED",
} as const;

export const NFT_MINT_STATUS = {
  QUEUED: "QUEUED",
  SUBMITTED: "SUBMITTED",
  MINTED: "MINTED",
  FAILED: "FAILED",
} as const;

export const whereReservedByProduct = (productId: string): Prisma.OrderItemWhereInput => ({
  productId,
  order: { status: ORDER_STATUS.PENDING },
});

export const whereSoldPendingMintByProduct = (productId: string): Prisma.OrderItemWhereInput => ({
  productId,
  order: { status: ORDER_STATUS.PAID },
  nftMints: {
    some: { status: { in: [NFT_MINT_STATUS.SUBMITTED] } },
  },
});

export const whereMintedByProduct = (productId: string): Prisma.OrderItemWhereInput => ({
  productId,
  nftMints: { some: { status: NFT_MINT_STATUS.MINTED } },
});
