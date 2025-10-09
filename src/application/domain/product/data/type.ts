import { Prisma } from "@prisma/client";

export const productSelect = Prisma.validator<Prisma.ProductSelect>()({
  id: true,
  type: true,
  name: true,
  description: true,
  imageUrl: true,

  price: true,
  maxSupply: true,
  startsAt: true,
  endsAt: true,

  nftProduct: true,
  integrations: {
    select: {
      id: true,
      provider: true,
      externalRef: true,
    },
  },

  createdAt: true,
  updatedAt: true,
});

export type PrismaProduct = Prisma.ProductGetPayload<{
  select: typeof productSelect;
}>;
