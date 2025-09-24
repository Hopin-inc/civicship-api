import { Prisma } from "@prisma/client";

const productSelectForOrderItem = Prisma.validator<Prisma.ProductSelect>()({
  id: true,
  name: true,
  price: true,
  nftProduct: {
    select: {
      id: true,
      externalRef: true,
      policyId: true,
    },
  },
});

export const orderItemSelectBase = Prisma.validator<Prisma.OrderItemSelect>()({
  id: true,

  priceSnapshot: true,
  quantity: true,

  orderId: true,
  order: true,

  productId: true,
  product: { select: productSelectForOrderItem },

  nftMints: {
    select: {
      id: true,
      status: true,
      txHash: true,
      createdAt: true,
      updatedAt: true,
    },
  },

  createdAt: true,
  updatedAt: true,
});

export type PrismaOrderItem = Prisma.OrderItemGetPayload<{ select: typeof orderItemSelectBase }>;
