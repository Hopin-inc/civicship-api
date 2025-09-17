import { Prisma } from "@prisma/client";

export const nftMintSelectBase = Prisma.validator<Prisma.NftMintDefaultArgs>()({
  select: {
    id: true,
    policyId: true,
    assetName: true,
    sequenceNum: true,
    receiver: true,
    txHash: true,
    status: true,
    error: true,
    createdAt: true,
    updatedAt: true,
  },
});

export type NftMintBase = Prisma.NftMintGetPayload<typeof nftMintSelectBase>;
