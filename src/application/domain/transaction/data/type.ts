import { Prisma } from "@prisma/client";

export const transactionInclude = Prisma.validator<Prisma.TransactionInclude>()({
  fromWallet: {
    include: {
      community: true,
      user: true,
    },
  },
  toWallet: {
    include: {
      community: true,
      user: true,
    },
  },
  participation: true,
});

export type PrismaTransaction = Prisma.TransactionGetPayload<{
  include: typeof transactionInclude;
}>;
