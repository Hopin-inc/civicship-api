import { Prisma } from "@prisma/client";
import { userInclude } from "@/application/domain/user/data/type";

export const walletInclude = Prisma.validator<Prisma.WalletInclude>()({
  community: true,
  user: { include: userInclude },
  currentPointView: true,
  accumulatedPointView: true,
});

export type PrismaWallet = Prisma.WalletGetPayload<{
  include: typeof walletInclude;
}>;
