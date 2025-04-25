import {
  GqlTransactionFilterInput,
  GqlTransactionGrantCommunityPointInput,
  GqlTransactionIssueCommunityPointInput,
  GqlTransactionSortInput,
} from "@/types/graphql";
import { Prisma, TransactionReason } from "@prisma/client";

export default class TransactionConverter {
  static filter(filter?: GqlTransactionFilterInput): Prisma.TransactionWhereInput {
    return {
      AND: [
        filter?.reason ? { reason: filter?.reason } : {},
        filter?.fromWalletId ? { from: filter?.fromWalletId } : {},
        filter?.toWalletId ? { to: filter?.toWalletId } : {},
      ],
    };
  }

  static sort(sort?: GqlTransactionSortInput): Prisma.TransactionOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  static issueCommunityPoint(
    input: GqlTransactionIssueCommunityPointInput,
  ): Prisma.TransactionCreateInput {
    const { toWalletId, transferPoints } = input;

    return {
      reason: TransactionReason.POINT_ISSUED,
      toWallet: { connect: { id: toWalletId } },
      fromPointChange: transferPoints,
      toPointChange: transferPoints,
    };
  }

  static grantCommunityPoint(
    input: GqlTransactionGrantCommunityPointInput,
    toWalletId: string,
  ): Prisma.TransactionCreateInput {
    const { fromWalletId, transferPoints } = input;

    return {
      reason: TransactionReason.GRANT,
      fromWallet: { connect: { id: fromWalletId } },
      fromPointChange: transferPoints,
      toWallet: { connect: { id: toWalletId } },
      toPointChange: transferPoints,
    };
  }

  static donateSelfPoint(
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

  static giveOnboardingPoint(
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
  ): Prisma.TransactionCreateInput {
    return {
      reason: TransactionReason.ONBOARDING,
      fromWallet: { connect: { id: fromWalletId } },
      fromPointChange: transferPoints,
      toWallet: { connect: { id: toWalletId } },
      toPointChange: transferPoints,
    };
  }

  static giveRewardPoint(
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

  static purchaseTicket(
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

  static refundTicket(
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
