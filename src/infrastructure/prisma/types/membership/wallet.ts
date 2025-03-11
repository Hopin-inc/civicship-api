import { Prisma } from "@prisma/client";

export const walletInclude = Prisma.validator<Prisma.WalletInclude>()({
  community: true,
  user: true,
  currentPointView: true,
  accumulatedPointView: true,
});

export type WalletPayloadWithArgs = Prisma.WalletGetPayload<{
  include: typeof walletInclude;
}>;
