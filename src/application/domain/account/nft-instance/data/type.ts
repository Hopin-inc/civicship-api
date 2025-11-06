import { Prisma } from "@prisma/client";

export const nftInstanceInclude = Prisma.validator<Prisma.NftInstanceInclude>()({
  nftToken: true,
  nftWallet: true,
});

export type PrismaNftInstance = Prisma.NftInstanceGetPayload<{
  include: typeof nftInstanceInclude;
}>;
