import { Prisma } from "@prisma/client";

/** repo/presenter で使う最小フィールド */
export const nftMintSelectForPresenter = Prisma.validator<Prisma.NftMintDefaultArgs>()({
  select: {
    id: true,
    txHash: true,
    status: true,
  },
});
export type NftMintForPresenter = Prisma.NftMintGetPayload<typeof nftMintSelectForPresenter>;

/** サービス/監査で使う基本フィールド */
export const nftMintSelectBase = Prisma.validator<Prisma.NftMintDefaultArgs>()({
  select: {
    id: true,
    policyId: true,
    assetName: true,
    receiver: true,
    txHash: true,
    status: true,
    error: true,
    createdAt: true,
    updatedAt: true,
  },
});
export type NftMintBase = Prisma.NftMintGetPayload<typeof nftMintSelectBase>;
