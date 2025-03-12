import {
  GqlTransactionFilterInput,
  GqlTransactionSortInput,
  GqlTransactionIssueCommunityPointInput,
  GqlTransactionGrantCommunityPointInput,
  GqlTransactionDonateSelfPointInput,
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
    const { toWalletId, toPointChange } = input;

    return {
      reason: TransactionReason.POINT_ISSUED,
      toWallet: { connect: { id: toWalletId } },
      fromPointChange: 0,
      toPointChange,
    };
  }

  static grantCommunityPoint(
    input: GqlTransactionGrantCommunityPointInput,
    toWalletId: string,
  ): Prisma.TransactionCreateInput {
    const { fromWalletId, fromPointChange, toPointChange } = input;

    return {
      reason: TransactionReason.GRANT,
      fromWallet: { connect: { id: fromWalletId } },
      fromPointChange,
      toWallet: { connect: { id: toWalletId } },
      toPointChange,
    };
  }

  static donateSelfPoint(
    input: GqlTransactionDonateSelfPointInput,
    toWalletId: string,
  ): Prisma.TransactionCreateInput {
    const { fromWalletId, fromPointChange, toPointChange } = input;

    return {
      reason: TransactionReason.DONATION,
      fromWallet: { connect: { id: fromWalletId } },
      fromPointChange,
      toWallet: { connect: { id: toWalletId } },
      toPointChange,
    };
  }

  static giveRewardPoint(params: GiveRewardPointParams): Prisma.TransactionCreateInput {
    return {
      reason: TransactionReason.POINT_REWARD,
      fromWallet: { connect: { id: params.fromWalletId } },
      fromPointChange: params.fromPointChange,
      toWallet: { connect: { id: params.toWalletId } },
      toPointChange: params.toPointChange,
      participation: { connect: { id: params.participationId } },
    };
  }

  static purchaseTicket(params: PurchaseTicketParams): Prisma.TransactionCreateInput {
    return {
      reason: TransactionReason.UTILITY_PURCHASED,
      fromWallet: { connect: { id: params.fromWalletId } },
      fromPointChange: -params.transferPoints,
      toWallet: { connect: { id: params.toWalletId } },
      toPointChange: params.transferPoints,
    };
  }

  static refundTicket(params: RefundTicketParams): Prisma.TransactionCreateInput {
    return {
      reason: TransactionReason.UTILITY_REFUNDED,
      fromWallet: { connect: { id: params.fromWalletId } },
      fromPointChange: -params.transferPoints,
      toWallet: { connect: { id: params.toWalletId } },
      toPointChange: params.transferPoints,
    };
  }
}

export type GiveRewardPointParams = {
  fromWalletId: string;
  toWalletId: string;
  fromPointChange: number;
  toPointChange: number;
  participationId: string;
};

export type PurchaseTicketParams = {
  fromWalletId: string;
  toWalletId: string;
  transferPoints: number;
};

export type RefundTicketParams = {
  fromWalletId: string;
  toWalletId: string;
  transferPoints: number;
};
