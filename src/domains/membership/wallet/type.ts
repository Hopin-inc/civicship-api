import { Prisma } from "@prisma/client";

export const walletInclude = Prisma.validator<Prisma.WalletInclude>()({
  community: {
    include: {
      city: { include: { state: true } },
    },
  },
  user: true,
  currentPointView: true,
});

export type WalletPayloadWithArgs = Prisma.WalletGetPayload<{
  include: typeof walletInclude;
}>;
