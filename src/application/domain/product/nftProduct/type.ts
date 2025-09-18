import { Prisma } from "@prisma/client";

export const nftProductSelectBase = Prisma.validator<Prisma.NftProductSelect>()({
  id: true,
  productId: true,
  product: true,

  policyId: true,

  createdAt: true,
  updatedAt: true,
});

export type PrismaNftProduct = Prisma.NftProductGetPayload<{ select: typeof nftProductSelectBase }>;
