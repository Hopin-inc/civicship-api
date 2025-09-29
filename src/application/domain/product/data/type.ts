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

  nftProduct: {
    select: {
      id: true,
      stripeProductId: true,
      nmkrProjectId: true,
      policyId: true,
    },
  },

  createdAt: true,
  updatedAt: true,
});

export type PrismaProduct = Prisma.ProductGetPayload<{
  select: typeof productSelect;
}>;

export interface InventorySnapshot {
  productId: string;
  reserved: number;
  soldPendingMint: number;
  minted: number;
  available: number;
  maxSupply: number | null;
}
