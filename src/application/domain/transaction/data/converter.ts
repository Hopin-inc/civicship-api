import { GqlTransactionFilterInput, GqlTransactionSortInput } from "@/types/graphql";
import { Prisma, TransactionReason } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class TransactionConverter {
  filter(filter?: GqlTransactionFilterInput): Prisma.TransactionWhereInput {
    return buildTransactionWhereInput(filter);
  }

  sort(sort?: GqlTransactionSortInput): Prisma.TransactionOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  issueCommunityPoint(toWalletId: string, transferPoints: number): Prisma.TransactionCreateInput {
    return {
      reason: TransactionReason.POINT_ISSUED,
      toWallet: { connect: { id: toWalletId } },
      fromPointChange: transferPoints,
      toPointChange: transferPoints,
    };
  }

  grantCommunityPoint(
    fromWalletId: string,
    transferPoints: number,
    toWalletId: string,
  ): Prisma.TransactionCreateInput {
    return {
      reason: TransactionReason.GRANT,
      fromWallet: { connect: { id: fromWalletId } },
      fromPointChange: transferPoints,
      toWallet: { connect: { id: toWalletId } },
      toPointChange: transferPoints,
    };
  }

  donateSelfPoint(
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
  ): Prisma.TransactionCreateInput {
    return {
      reason: TransactionReason.DONATION,
      fromWallet: { connect: { id: fromWalletId } },
      fromPointChange: transferPoints,
      toWallet: { connect: { id: toWalletId } },
      toPointChange: transferPoints,
    };
  }

  giveRewardPoint(
    fromWalletId: string,
    toWalletId: string,
    participationId: string,
    transferPoints: number,
  ): Prisma.TransactionCreateInput {
    return {
      reason: TransactionReason.POINT_REWARD,
      fromWallet: { connect: { id: fromWalletId } },
      fromPointChange: transferPoints,
      toWallet: { connect: { id: toWalletId } },
      toPointChange: transferPoints,
      participation: { connect: { id: participationId } },
    };
  }

  purchaseTicket(
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
  ): Prisma.TransactionCreateInput {
    return {
      reason: TransactionReason.TICKET_PURCHASED,
      fromWallet: { connect: { id: fromWalletId } },
      fromPointChange: transferPoints,
      toWallet: { connect: { id: toWalletId } },
      toPointChange: transferPoints,
    };
  }

  refundTicket(
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
  ): Prisma.TransactionCreateInput {
    return {
      reason: TransactionReason.TICKET_REFUNDED,
      fromWallet: { connect: { id: fromWalletId } },
      fromPointChange: transferPoints,
      toWallet: { connect: { id: toWalletId } },
      toPointChange: transferPoints,
    };
  }
}

function buildTransactionWhereInput(
  filter?: GqlTransactionFilterInput,
): Prisma.TransactionWhereInput {
  if (!filter) return {};

  const conditions: Prisma.TransactionWhereInput[] = [];

  if (filter.reason) conditions.push({ reason: filter.reason });
  if (filter.fromWalletId) conditions.push({ from: filter.fromWalletId });
  if (filter.toWalletId) conditions.push({ to: filter.toWalletId });
  if (filter.fromUserId) conditions.push({ fromWallet: { user: { id: filter.fromUserId } } });
  if (filter.toUserId) conditions.push({ toWallet: { user: { id: filter.toUserId } } });
  if (filter.fromWalletType) conditions.push({ fromWallet: { type: filter.fromWalletType } });
  if (filter.toWalletType) conditions.push({ toWallet: { type: filter.toWalletType } });

  // 再帰的に and/or/not を処理
  if (filter.and) {
    conditions.push({
      AND: filter.and.map((f) => buildTransactionWhereInput(f)),
    });
  }

  if (filter.or) {
    conditions.push({
      OR: filter.or.map((f) => buildTransactionWhereInput(f)),
    });
  }

  if (filter.not) {
    conditions.push({
      NOT: buildTransactionWhereInput(filter.not),
    });
  }

  return {
    AND: conditions,
  };
}
