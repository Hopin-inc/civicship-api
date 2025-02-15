import { Prisma } from "@prisma/client";

export const transactionInclude = Prisma.validator<Prisma.TransactionInclude>()({
  fromWallet: {
    include: {
      community: true,
      // community: {
      //   include: { city: { include: { state: true } } },
      // },
      user: true,
    },
  },
  toWallet: {
    include: {
      community: true,
      // community: {
      //   include: { city: { include: { state: true } } },
      // },
      user: true,
    },
  },
  participation: true,
  utility: {
    include: {
      community: true,
      // community: {
      //   include: { city: { include: { state: true } } },
      // },
    },
  },
});

export type TransactionPayloadWithArgs = Prisma.TransactionGetPayload<{
  include: typeof transactionInclude;
}>;
