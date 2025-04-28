import {
  GqlTransactionFilterInput,
  GqlTransactionGrantCommunityPointInput,
  GqlTransactionIssueCommunityPointInput,
  GqlTransactionSortInput,
} from "@/types/graphql";
import { Prisma, TransactionReason } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class TransactionConverter {
  filter(filter?: GqlTransactionFilterInput): Prisma.TransactionWhereInput {
    return {
      AND: [
        filter?.reason ? { reason: filter?.reason } : {},
        filter?.fromWalletId ? { from: filter?.fromWalletId } : {},
        filter?.toWalletId ? { to: filter?.toWalletId } : {},
      ],
    };
  }

  sort(sort?: GqlTransactionSortInput): Prisma.TransactionOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  issueCommunityPoint(
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

  grantCommunityPoint(
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
