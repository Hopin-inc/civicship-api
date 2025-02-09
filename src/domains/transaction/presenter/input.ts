import {
  GqlTransactionFilterInput,
  GqlTransactionSortInput,
  GqlTransactionIssueCommunityPointInput,
  GqlTransactionGrantCommunityPointInput,
  GqlTransactionDonateSelfPointInput,
  GqlTransactionGiveRewardPointInput,
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
        filter?.utilityId ? { utilityId: filter?.utilityId } : {},
      ],
    };
  }

  static sort(sort?: GqlTransactionSortInput): Prisma.TransactionOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  static giveRewardPoint(input: GqlTransactionGiveRewardPointInput): Prisma.TransactionCreateInput {
    const { from, to, fromPointChange, toPointChange } = input;

    return {
      reason: TransactionReason.PARTICIPATION_APPROVED,
      fromWallet: { connect: { id: from } },
      fromPointChange,
      toWallet: { connect: { id: to } },
      toPointChange,
    };
  }

  static issueCommunityPoint(
    input: GqlTransactionIssueCommunityPointInput,
  ): Prisma.TransactionCreateInput {
    const { to, toPointChange } = input;

    return {
      reason: TransactionReason.POINT_ISSUED,
      toWallet: { connect: { id: to } },
      toPointChange,
    };
  }

  static grantCommunityPoint(
    input: GqlTransactionGrantCommunityPointInput,
  ): Prisma.TransactionCreateInput {
    const { from, to, fromPointChange, toPointChange } = input;

    return {
      reason: TransactionReason.GIFT,
      fromWallet: { connect: { id: from } },
      fromPointChange,
      toWallet: { connect: { id: to } },
      toPointChange,
    };
  }

  static donateSelfPoint(input: GqlTransactionDonateSelfPointInput): Prisma.TransactionCreateInput {
    const { from, to, fromPointChange, toPointChange } = input;

    return {
      reason: TransactionReason.GIFT,
      fromWallet: { connect: { id: from } },
      fromPointChange,
      toWallet: { connect: { id: to } },
      toPointChange,
    };
  }
}
