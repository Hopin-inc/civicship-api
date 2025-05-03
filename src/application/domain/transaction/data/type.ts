import { Prisma } from "@prisma/client";

export const transactionInclude = Prisma.validator<Prisma.TransactionInclude>()({
  fromWallet: true,
  toWallet: true,
  participation: true,
});

export const transactionSelectDetail = Prisma.validator<Prisma.TransactionSelect>()({
  id: true,
  amount: true,
  type: true,
  status: true,
  fromWalletId: true,
  toWalletId: true,
  participationId: true,
  createdAt: true,
  updatedAt: true,
  fromWallet: { select: { id: true, userId: true, communityId: true } },
  toWallet: { select: { id: true, userId: true, communityId: true } },
  participation: { select: { id: true } },
});

export type PrismaTransaction = Prisma.TransactionGetPayload<{
  include: typeof transactionInclude;
}>;

export type PrismaTransactionDetail = Prisma.TransactionGetPayload<{
  select: typeof transactionSelectDetail;
}>;
