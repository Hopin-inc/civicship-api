import { Prisma } from "@prisma/client";

export const walletInclude = Prisma.validator<Prisma.WalletInclude>()({
  community: true,
  user: true,
  currentPointView: true,
});

export const walletSelectDetail = Prisma.validator<Prisma.WalletSelect>()({
  id: true,
  type: true,
  userId: true,
  communityId: true,
  createdAt: true,
  updatedAt: true,
  currentPointView: true,
});

export type PrismaWallet = Prisma.WalletGetPayload<{
  include: typeof walletInclude;
}>;

export type PrismaWalletDetail = Prisma.WalletGetPayload<{
  select: typeof walletSelectDetail;
}>;
