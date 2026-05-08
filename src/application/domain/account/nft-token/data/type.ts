import { Prisma } from "@prisma/client";

export const nftTokenSelect = Prisma.validator<Prisma.NftTokenSelect>()({
  id: true,
  address: true,
  name: true,
  symbol: true,
  type: true,
  json: true,
  communityId: true,
  issuedByVendor: true,
  chain: true,
  createdAt: true,
  updatedAt: true,
});

export type PrismaNftToken = Prisma.NftTokenGetPayload<{
  select: typeof nftTokenSelect;
}>;
