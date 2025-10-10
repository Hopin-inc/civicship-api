import { Prisma } from "@prisma/client";

export const nftInstanceInclude = Prisma.validator<Prisma.NftInstanceInclude>()({
  nftProduct: { include: { nftToken: true, product: true } },
  nftWallet: true,
});

export type PrismaNftInstance = Prisma.NftInstanceGetPayload<{
  include: typeof nftInstanceInclude;
}>;
