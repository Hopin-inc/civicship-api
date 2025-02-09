import { Prisma } from "@prisma/client";
import { transactionInclude } from "@/domains/transaction/type";

export const walletInclude = Prisma.validator<Prisma.WalletInclude>()({
  community: {
    include: {
      city: { include: { state: true } },
    },
  },
  user: true,
  currentPointView: true,

  fromTransactions: { include: transactionInclude },
  toTransactions: { include: transactionInclude },
});

export type WalletPayloadWithArgs = Prisma.WalletGetPayload<{
  include: typeof walletInclude;
}>;
