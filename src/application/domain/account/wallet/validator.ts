import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { GqlTransactionReason as TransactionReason } from "@/types/graphql";
import { 
  InsufficientBalanceError, 
  InvalidTransferMethodError,
  MissingWalletInformationError,
  UnsupportedTransactionReasonError
} from "@/errors/graphql";
import { PrismaWallet } from "@/application/domain/account/wallet/data/type";
import WalletService from "@/application/domain/account/wallet/service";
import { inject, injectable } from "tsyringe";

@injectable()
export default class WalletValidator {
  constructor(
    @inject("WalletService")
    private readonly service: Pick<
      WalletService,
      "findCommunityWalletOrThrow" | "createMemberWalletIfNeeded" | "findMemberWalletOrThrow"
    >,
  ) {}

  async validateCommunityMemberTransfer(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    communityId: string,
    userId: string,
    transferPoints: number,
    reason: TransactionReason,
  ) {
    const direction = getTransferDirection(reason);
    const createIfNeeded = reason === TransactionReason.Grant;

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

  private async getWalletPairByDirection(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    direction: TransferDirection,
    communityId: string,
    userId: string,
    createIfNeeded: boolean,
  ) {
    const communityWallet = await this.service.findCommunityWalletOrThrow(ctx, communityId);
    const memberWallet = createIfNeeded
      ? await this.service.createMemberWalletIfNeeded(ctx, userId, communityId, tx)
      : await this.service.findMemberWalletOrThrow(ctx, userId, communityId);

    switch (direction) {
      case TransferDirection.COMMUNITY_TO_MEMBER:
        return { from: communityWallet, to: memberWallet };
      case TransferDirection.MEMBER_TO_COMMUNITY:
        return { from: memberWallet, to: communityWallet };
      case TransferDirection.MEMBER_TO_MEMBER:
        throw new InvalidTransferMethodError();
    }
  }

  async validateTransferMemberToMember(
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

  async validateTransfer(
    transferPoints: number,
    fromWallet: Pick<PrismaWallet, "currentPointView"> | null,
    toWallet: Pick<PrismaWallet, "currentPointView"> | null,
  ) {
    if (!fromWallet || !toWallet) {
      const invalidArgs = [
        ...(!fromWallet ? ["fromWallet"] : []),
        ...(!toWallet ? ["toWallet"] : []),
      ];
      throw new MissingWalletInformationError(invalidArgs);
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
    case TransactionReason.Onboarding:
    case TransactionReason.Grant:
      return TransferDirection.COMMUNITY_TO_MEMBER;
    case TransactionReason.PointReward:
    case TransactionReason.TicketPurchased:
    case TransactionReason.TicketRefunded:
    case TransactionReason.Donation:
      return TransferDirection.MEMBER_TO_MEMBER;
    default:
      throw new UnsupportedTransactionReasonError(reason);
  }
}
