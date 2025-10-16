import { Prisma } from '@prisma/client';

export const orderSelectWithItems = Prisma.validator<Prisma.OrderDefaultArgs>()({
  include: {
    items: {
      include: {
        product: {
          include: {
            nftProduct: true,
            integrations: true,
          },
        },
        nftMints: true,
      },
    },
    user: true,
  },
});

export type OrderWithItems = Prisma.OrderGetPayload<typeof orderSelectWithItems>;

export const orderItemSelectWithProduct = Prisma.validator<Prisma.OrderItemDefaultArgs>()({
  include: {
    product: {
      include: {
        nftProduct: true,
      },
    },
    nftMints: true,
  },
});

export type OrderItemWithProduct = Prisma.OrderItemGetPayload<typeof orderItemSelectWithProduct>;
