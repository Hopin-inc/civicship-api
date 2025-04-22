import { IContext } from "@/types/server";
import { Prisma, TransactionReason } from "@prisma/client";
import { InsufficientBalanceError, ValidationError } from "@/errors/graphql";
import { GqlWallet } from "@/types/graphql";
import WalletService from "@/application/domain/membership/wallet/service";
import { PrismaWallet } from "@/application/domain/membership/wallet/data/type";

export default class WalletValidator {
  static async validateCommunityMemberTransfer(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    communityId: string,
    userId: string,
    transferPoints: number,
    reason: TransactionReason,
  ) {
    const direction = getTransferDirection(reason);
    const createIfNeeded = reason === TransactionReason.GRANT;

    const { from, to } = await this.getWalletPairByDirection(
      ctx,
      tx,
      direction,
      communityId,
      userId,
      createIfNeeded,
    );

    await this.validateTransfer(transferPoints, from, to);
    return { fromWalletId: from.id, toWalletId: to.id };
  }

  private static async getWalletPairByDirection(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    direction: TransferDirection,
    communityId: string,
    userId: string,
    createIfNeeded: boolean,
  ) {
    const communityWallet = await WalletService.findCommunityWalletOrThrow(ctx, communityId);
    const memberWallet = createIfNeeded
      ? await WalletService.createMemberWalletIfNeeded(ctx, userId, communityId, tx)
      : await WalletService.findMemberWalletOrThrow(ctx, userId, communityId, tx);

    switch (direction) {
      case TransferDirection.COMMUNITY_TO_MEMBER:
        return { from: communityWallet, to: memberWallet };
      case TransferDirection.MEMBER_TO_COMMUNITY:
        return { from: memberWallet, to: communityWallet };
      case TransferDirection.MEMBER_TO_MEMBER:
        throw new ValidationError("Use validateMemberToMemberDonation() for DONATION");
    }
  }

  static async validateMemberToMemberDonation(
    fromWallet: PrismaWallet,
    toWallet: PrismaWallet,
    transferPoints: number,
  ) {
    await this.validateTransfer(transferPoints, fromWallet, toWallet);

    return {
      fromWalletId: fromWallet.id,
      toWalletId: toWallet.id,
    };
  }

  static async validateTransfer(
    transferPoints: number,
    fromWallet: GqlWallet | null,
    toWallet: GqlWallet | null,
  ) {
    if (!fromWallet || !toWallet) {
      const invalidArgs = [
        ...(!fromWallet ? ["fromWallet"] : []),
        ...(!toWallet ? ["toWallet"] : []),
      ];
      throw new ValidationError("Wallet information is missing for points transfer", invalidArgs);
    }
    const { currentPoint } = fromWallet.currentPointView || {};

    if (!currentPoint || currentPoint < transferPoints) {
      throw new InsufficientBalanceError(currentPoint ?? 0, transferPoints);
    }
  }
}

enum TransferDirection {
  COMMUNITY_TO_MEMBER = "community-to-member",
  MEMBER_TO_COMMUNITY = "member-to-community",
  MEMBER_TO_MEMBER = "member-to-member",
}

function getTransferDirection(reason: TransactionReason): TransferDirection {
  switch (reason) {
    case TransactionReason.POINT_REWARD:
    case TransactionReason.ONBOARDING:
    case TransactionReason.GRANT:
    case TransactionReason.TICKET_REFUNDED:
      return TransferDirection.COMMUNITY_TO_MEMBER;
    case TransactionReason.TICKET_PURCHASED:
      return TransferDirection.MEMBER_TO_COMMUNITY;
    case TransactionReason.DONATION:
      return TransferDirection.MEMBER_TO_MEMBER;
    default:
      throw new ValidationError(`Unsupported TransactionReason`, [reason]);
  }
}
