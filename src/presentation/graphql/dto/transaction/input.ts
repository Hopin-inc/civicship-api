import {
  GqlTransactionFilterInput,
  GqlTransactionSortInput,
  GqlTransactionIssueCommunityPointInput,
  GqlTransactionGrantCommunityPointInput,
  GqlTransactionDonateSelfPointInput,
  GqlTransactionGiveRewardPointInput,
  GqlTransactionRedeemUtilityInput,
} from "@/types/graphql";
import { Prisma, TransactionReason } from "@prisma/client";

export default class TransactionInputFormat {
  static filter(filter?: GqlTransactionFilterInput): Prisma.TransactionWhereInput {
    return {
      AND: [
        filter?.id ? { id: filter?.id } : {},
        filter?.reason ? { reason: filter?.reason } : {},
        filter?.fromWalletId ? { from: filter?.fromWalletId } : {},
        filter?.toWalletId ? { to: filter?.toWalletId } : {},
        filter?.participationId ? { participationId: filter?.participationId } : {},
      ],
    };
  }

  static sort(sort?: GqlTransactionSortInput): Prisma.TransactionOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  static giveRewardPoint(input: GqlTransactionGiveRewardPointInput): Prisma.TransactionCreateInput {
    const { fromWalletId, toWalletId, fromPointChange, toPointChange, participationId } = input;

    return {
      reason: TransactionReason.POINT_REWARD,
      fromWallet: { connect: { id: fromWalletId } },
      fromPointChange,
      toWallet: { connect: { id: toWalletId } },
      toPointChange,
      participation: { connect: { id: participationId } },
    };
  }

  static issueCommunityPoint(
    input: GqlTransactionIssueCommunityPointInput,
  ): Prisma.TransactionCreateInput {
    const { toWalletId, toPointChange } = input;

    return {
      reason: TransactionReason.POINT_ISSUED,
      toWallet: { connect: { id: toWalletId } },
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

  static redeemUtility(input: GqlTransactionRedeemUtilityInput): Prisma.TransactionCreateInput {
    const { fromWalletId, toWalletId, transferPoints } = input;

    return {
      reason: TransactionReason.UTILITY_REDEEMED,
      fromWallet: { connect: { id: fromWalletId } },
      fromPointChange: -transferPoints,
      toWallet: { connect: { id: toWalletId } },
      toPointChange: transferPoints,
    };
  }
}
