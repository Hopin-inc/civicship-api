import { Prisma } from '@prisma/client';

export const nftProductIncludeForService = Prisma.validator<Prisma.NftProductDefaultArgs>()({
  include: {
    product: true,
  },
});
export type NftProductForService = Prisma.NftProductGetPayload<typeof nftProductIncludeForService>;
