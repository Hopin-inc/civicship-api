import { Prisma } from "@prisma/client";
import { productSelectBase } from "@/application/domain/product/type";

export const orderItemSelectBase = Prisma.validator<Prisma.OrderItemSelect>()({
  id: true,

  priceSnapshot: true,
  quantity: true,

  orderId: true,
  order: true,

  productId: true,
  product: { select: productSelectBase },

  nftMints: true,

  createdAt: true,
  updatedAt: true,
});

export type PrismaOrderItem = Prisma.OrderItemGetPayload<{ select: typeof orderItemSelectBase }>;
