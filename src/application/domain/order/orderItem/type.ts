import { Prisma } from "@prisma/client";

export const orderItemSelectBase = Prisma.validator<Prisma.OrderItemSelect>()({
  id: true,
  orderId: true,
  order: true,

  productId: true,
  product: true,

  quantity: true,
  priceSnapshot: true,

  nftMints: true,

  createdAt: true,
  updatedAt: true,
});

export type PrismaOrderItem = Prisma.OrderItemGetPayload<{ select: typeof orderItemSelectBase }>;
