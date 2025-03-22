import { Prisma, TransactionReason } from "@prisma/client";
import WalletConverter from "@/application/membership/wallet/data/converter";
import WalletRepository from "@/application/membership/wallet/data/repository";
import { IContext } from "@/types/server";
import { GqlQueryWalletsArgs, GqlWallet } from "@/types/graphql";
import WalletUtils from "@/application/membership/wallet/utils";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import WalletPresenter from "@/application/membership/wallet/presenter";

export default class WalletService {
  static async fetchWallets(
    ctx: IContext,
    { filter, sort, cursor }: GqlQueryWalletsArgs,
    take: number,
  ) {
    const where = WalletConverter.filter(filter ?? {});
    const orderBy = WalletConverter.sort(sort ?? {});

    return WalletRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findWallet(ctx: IContext, id: string) {
    return WalletRepository.find(ctx, id);
  }

  static async findMemberWalletOrThrow(
    ctx: IContext,
    userId: string,
    communityId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<GqlWallet> {
    const wallet = await WalletRepository.findFirstExistingMemberWallet(
      ctx,
      communityId,
      userId,
      tx,
    );
    if (!wallet) {
      throw new NotFoundError("Member wallet" + `userId:${userId}, communityId:${communityId}`);
    }

    return WalletPresenter.get(wallet);
  }

  static async findCommunityWalletOrThrow(ctx: IContext, communityId: string): Promise<GqlWallet> {
    const wallet = await WalletRepository.findCommunityWallet(ctx, communityId);
    if (!wallet?.id) {
      throw new NotFoundError("Community wallet", { communityId });
    }
    return WalletPresenter.get(wallet);
  }

  static async checkIfMemberWalletExists(
    ctx: IContext,
    memberWalletId: string,
  ): Promise<GqlWallet> {
    const wallet = await WalletRepository.find(ctx, memberWalletId);
    if (!wallet) {
      throw new NotFoundError("Member wallet", { memberWalletId });
    }

    return WalletPresenter.get(wallet);
  }

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

    await WalletUtils.validateTransfer(transferPoints, from, to);
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
    const communityWallet = await this.findCommunityWalletOrThrow(ctx, communityId);
    const memberWallet = createIfNeeded
      ? await this.createMemberWalletIfNeeded(ctx, userId, communityId, tx)
      : await this.findMemberWalletOrThrow(ctx, communityId, userId, tx);

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
    ctx: IContext,
    tx: Prisma.TransactionClient,
    fromWalletId: string,
    toUserId: string,
    communityId: string,
    transferPoints: number,
  ) {
    const fromWallet = await this.checkIfMemberWalletExists(ctx, fromWalletId);
    const toWallet = await this.createMemberWalletIfNeeded(ctx, toUserId, communityId, tx);

    await WalletUtils.validateTransfer(transferPoints, fromWallet, toWallet);

    return {
      fromWalletId: fromWallet.id,
      toWalletId: toWallet.id,
    };
  }

  static async createCommunityWallet(
    ctx: IContext,
    communityId: string,
    tx: Prisma.TransactionClient,
  ) {
    const data: Prisma.WalletCreateInput = WalletConverter.createCommunityWallet({
      communityId,
    });
    return WalletRepository.create(ctx, data, tx);
  }

  static async createMemberWalletIfNeeded(
    ctx: IContext,
    userId: string,
    communityId: string,
    tx: Prisma.TransactionClient,
  ) {
    const existingWallet = await WalletRepository.findFirstExistingMemberWallet(
      ctx,
      communityId,
      userId,
      tx,
    );
    if (existingWallet) {
      return existingWallet;
    }

    const data: Prisma.WalletCreateInput = WalletConverter.createMemberWallet({
      userId,
      communityId,
    });
    return WalletRepository.create(ctx, data, tx);
  }

  static async deleteMemberWallet(
    ctx: IContext,
    userId: string,
    communityId: string,
    tx: Prisma.TransactionClient,
  ) {
    const memberWallet = await this.findMemberWalletOrThrow(ctx, communityId, userId, tx);
    return WalletRepository.delete(ctx, memberWallet.id);
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
