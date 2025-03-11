import { Prisma } from "@prisma/client";
import { communityInclude } from "@/application/community/data/type";
import { userInclude } from "@/application/user/data/type";

export const walletInclude = Prisma.validator<Prisma.WalletInclude>()({
  community: { include: communityInclude },
  user: { include: userInclude },
  currentPointView: true,
  accumulatedPointView: true,
});

export type PrismaWallet = Prisma.WalletGetPayload<{
  include: typeof walletInclude;
}>;
