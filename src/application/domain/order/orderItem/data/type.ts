import { Prisma } from "@prisma/client";

export const orderItemInclude = Prisma.validator<Prisma.OrderItemInclude>()({
  product: true,
  order: true,
  nftMints: true,
});

export type OrderItemWithProduct = Prisma.OrderItemGetPayload<{
  include: typeof orderItemInclude;
}>;

export type OrderItemWithRelations = OrderItemWithProduct;
