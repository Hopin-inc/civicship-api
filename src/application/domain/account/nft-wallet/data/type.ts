import { Prisma } from "@prisma/client";

export const nftWalletSelectDetail = {
    id: true,
    userId: true,
    walletAddress: true,
    type: true,
    apiKey: true,
    externalRef: true,
    createdAt: true,
    updatedAt: true,
} as const;

export type PrismaNftWalletDetail = Prisma.NftWalletGetPayload<{
    select: typeof nftWalletSelectDetail;
}>;

export const nftWalletCreateSelect = {
    id: true,
    userId: true,
    walletAddress: true,
    type: true,
    apiKey: true,
    externalRef: true,
    createdAt: true,
    updatedAt: true,
} as const;

export type PrismaNftWalletCreateDetail = Prisma.NftWalletGetPayload<{
    select: typeof nftWalletCreateSelect;
}>;
