import { Prisma } from '@prisma/client';

export const nftMintIncludeForService = Prisma.validator<Prisma.NftMintDefaultArgs>()({
  include: {
    orderItem: {
      include: {
        product: {
          include: {
            nftProduct: true,
          },
        },
      },
    },
    nftWallet: true,
  },
});
export type NftMintForService = Prisma.NftMintGetPayload<typeof nftMintIncludeForService>;

export type NftMintForPresenter = {
  id: string;
  status: string;
  txHash: string | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date | null;
};
