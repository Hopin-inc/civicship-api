import { Prisma, OrderStatus, NftMintStatus } from "@prisma/client";

export const whereReservedByProduct = (productId: string): Prisma.OrderItemWhereInput => ({
  productId,
  order: { status: OrderStatus.PENDING },
});

export const whereSoldPendingMintByProduct = (productId: string): Prisma.OrderItemWhereInput => ({
  productId,
  order: { status: OrderStatus.PAID },
  nftMints: {
    some: { status: { in: [NftMintStatus.SUBMITTED] } },
  },
});

export const whereMintedByProduct = (productId: string): Prisma.OrderItemWhereInput => ({
  productId,
  nftMints: { some: { status: NftMintStatus.MINTED } },
});
