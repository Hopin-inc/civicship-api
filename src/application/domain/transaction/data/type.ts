import { Prisma } from "@prisma/client";

export const transactionInclude = Prisma.validator<Prisma.TransactionInclude>()({
  fromWallet: true,
  toWallet: true,
  participation: true,
  createdByUser: true,
});

export const transactionSelectDetail = Prisma.validator<Prisma.TransactionSelect>()({
  id: true,
  reason: true,
  fromPointChange: true,
  toPointChange: true,

  from: true,
  to: true,
  participationId: true,
  reservationId: true,

  createdBy: true,

  createdAt: true,
  updatedAt: true,
});

export type PrismaTransaction = Prisma.TransactionGetPayload<{
  include: typeof transactionInclude;
}>;

export type PrismaTransactionDetail = Prisma.TransactionGetPayload<{
  select: typeof transactionSelectDetail;
}>;

export type PrismaTransactionUnified = PrismaTransaction | PrismaTransactionDetail;
