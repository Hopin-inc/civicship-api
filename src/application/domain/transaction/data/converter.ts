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

  issueCommunityPoint(
    toWalletId: string,
    transferPoints: number,
    createdBy: string,
    comment?: string,
  ): Prisma.TransactionCreateInput {
    return {
      reason: TransactionReason.POINT_ISSUED,
      toWallet: { connect: { id: toWalletId } },
      fromPointChange: transferPoints,
      toPointChange: transferPoints,
      createdByUser: { connect: { id: createdBy } },
      comment,
    };
  }

  grantCommunityPoint(
    fromWalletId: string,
    transferPoints: number,
    toWalletId: string,
    createdBy: string,
    comment?: string,
  ): Prisma.TransactionCreateInput {
    return {
      reason: TransactionReason.GRANT,
      fromWallet: { connect: { id: fromWalletId } },
      fromPointChange: transferPoints,
      toWallet: { connect: { id: toWalletId } },
      toPointChange: transferPoints,
      createdByUser: { connect: { id: createdBy } },
      comment,
    };
  }

  donateSelfPoint(
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
    createdBy: string,
    comment?: string,
  ): Prisma.TransactionCreateInput {
    return {
      reason: TransactionReason.DONATION,
      fromWallet: { connect: { id: fromWalletId } },
      fromPointChange: transferPoints,
      toWallet: { connect: { id: toWalletId } },
      toPointChange: transferPoints,
      createdByUser: { connect: { id: createdBy } },
      comment,
    };
  }

  reservationCreated(
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
    createdBy: string,
    reservationId: string,
    reason: TransactionReason,
  ): Prisma.TransactionCreateInput {
    return {
      reason,
      fromWallet: { connect: { id: fromWalletId } },
      fromPointChange: transferPoints,
      toWallet: { connect: { id: toWalletId } },
      toPointChange: transferPoints,
      createdByUser: { connect: { id: createdBy } },
      reservation: { connect: { id: reservationId } },
    };
  }

  giveRewardPoint(
    fromWalletId: string,
    toWalletId: string,
    participationId: string,
    transferPoints: number,
    createdBy: string,
  ): Prisma.TransactionCreateInput {
    return {
      reason: TransactionReason.POINT_REWARD,
      fromWallet: { connect: { id: fromWalletId } },
      fromPointChange: transferPoints,
      toWallet: { connect: { id: toWalletId } },
      toPointChange: transferPoints,
      participation: { connect: { id: participationId } },
      createdByUser: { connect: { id: createdBy } },
    };
  }

  purchaseTicket(
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
    createdBy: string,
  ): Prisma.TransactionCreateInput {
    return {
      reason: TransactionReason.TICKET_PURCHASED,
      fromWallet: { connect: { id: fromWalletId } },
      fromPointChange: transferPoints,
      toWallet: { connect: { id: toWalletId } },
      toPointChange: transferPoints,
      createdByUser: { connect: { id: createdBy } },
    };
  }

  refundTicket(
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
    createdBy: string,
  ): Prisma.TransactionCreateInput {
    return {
      reason: TransactionReason.TICKET_REFUNDED,
      fromWallet: { connect: { id: fromWalletId } },
      fromPointChange: transferPoints,
      toWallet: { connect: { id: toWalletId } },
      toPointChange: transferPoints,
      createdByUser: { connect: { id: createdBy } },
    };
  }

  signupBonus(
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
    comment?: string,
  ): Prisma.TransactionCreateInput {
    return {
      reason: TransactionReason.ONBOARDING,
      fromWallet: { connect: { id: fromWalletId } },
      fromPointChange: -transferPoints,
      toWallet: { connect: { id: toWalletId } },
      toPointChange: transferPoints,
      comment: comment ?? "新規登録ボーナス",
    };
  }
}

function buildTransactionWhereInput(
  filter?: GqlTransactionFilterInput,
): Prisma.TransactionWhereInput {
  if (!filter) return {};

  const conditions: Prisma.TransactionWhereInput[] = [];

  if (filter.communityId) {
    conditions.push({
      OR: [
        { fromWallet: { community: { id: filter.communityId } } },
        { toWallet: { community: { id: filter.communityId } } },
      ],
    });
  }
  if (filter.reason) conditions.push({ reason: filter.reason });
  if (filter.fromWalletId) conditions.push({ from: filter.fromWalletId });
  if (filter.toWalletId) conditions.push({ to: filter.toWalletId });
  if (filter.fromUserId) conditions.push({ fromWallet: { user: { id: filter.fromUserId } } });
  if (filter.toUserId) conditions.push({ toWallet: { user: { id: filter.toUserId } } });
  if (filter.fromWalletType) conditions.push({ fromWallet: { type: filter.fromWalletType } });
  if (filter.toWalletType) conditions.push({ toWallet: { type: filter.toWalletType } });
  if (filter.fromUserName) conditions.push({ fromWallet: { user: { name: { contains: filter.fromUserName } } } });
  if (filter.toUserName) conditions.push({ toWallet: { user: { name: { contains: filter.toUserName } } } });
  if (filter.fromDidValue) conditions.push({ fromWallet: { user: { didIssuanceRequests: { some: { didValue: { contains: filter.fromDidValue } } } } } });
  if (filter.toDidValue) conditions.push({ toWallet: { user: { didIssuanceRequests: { some: { didValue: { contains: filter.toDidValue } } } } } });
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
