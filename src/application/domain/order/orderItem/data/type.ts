import { Prisma } from "@prisma/client";

export const orderItemInclude = Prisma.validator<Prisma.OrderItemInclude>()({
  product: true,
  order: true,
  nftMints: true,
});

export type OrderItemWithRelations = Prisma.OrderItemGetPayload<{
  include: typeof orderItemInclude;
}>;
