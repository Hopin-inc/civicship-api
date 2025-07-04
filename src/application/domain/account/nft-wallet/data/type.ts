export const nftWalletSelectDetail = {
  id: true,
  userId: true,
  walletAddress: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type PrismaNftWalletDetail = {
  id: string;
  userId: string;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date | null;
};
