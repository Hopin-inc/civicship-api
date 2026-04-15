import { Prisma, TransactionReason } from "@prisma/client";

export const transactionInclude = Prisma.validator<Prisma.TransactionInclude>()({
  fromWallet: true,
  toWallet: true,
  participation: true,
  createdByUser: true,
});

export const transactionSelectDetail = Prisma.validator<Prisma.TransactionSelect>()({
  id: true,
  reason: true,
  comment: true,
  fromPointChange: true,
  toPointChange: true,

  from: true,
  to: true,
  participationId: true,
  reservationId: true,

  parentTxId: true,
  chainDepth: true,

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

export type TransactionChainRow = {
  id: string;
  reason: TransactionReason;
  points: number;
  created_at: Date;
  from_user_id: string | null;
  from_user_name: string | null;
  from_user_image: string | null;
  to_user_id: string | null;
  to_user_name: string | null;
  to_user_image: string | null;
};
