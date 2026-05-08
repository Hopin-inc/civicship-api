import { Prisma, Role, TransactionReason } from "@prisma/client";
import { IContext } from "@/types/server";
import TransactionPresenter from "@/application/domain/transaction/presenter";
import MembershipService from "@/application/domain/account/membership/service";
import WalletValidator from "@/application/domain/account/wallet/validator";
import WalletService from "@/application/domain/account/wallet/service";
import NotificationService from "@/application/domain/notification/service";
import { clampFirst, getCommunityIdFromCtx, getCurrentUserId } from "@/application/domain/utils";
import { ITransactionService } from "@/application/domain/transaction/data/interface";
import { AuthorizationError, NotFoundError } from "@/errors/graphql";
import ImageService from "@/application/domain/content/image/service";
import logger from "@/infrastructure/logging";
import {
  GqlImageInput,
  GqlMutationTransactionDonateSelfPointArgs,
  GqlMutationTransactionGrantCommunityPointArgs,
  GqlMutationTransactionIssueCommunityPointArgs,
  GqlMutationTransactionUpdateMetadataArgs,
  GqlQueryTransactionArgs,
  GqlQueryTransactionsArgs,
  GqlTransaction,
  GqlTransactionDonateSelfPointPayload,
  GqlTransactionGrantCommunityPointPayload,
  GqlTransactionIssueCommunityPointPayload,
  GqlTransactionUpdateMetadataPayload,
  GqlTransactionsConnection,
} from "@/types/graphql";
import { inject, injectable } from "tsyringe";

@injectable()
export default class TransactionUseCase {
  constructor(
    @inject("TransactionService") private readonly transactionService: ITransactionService,
    @inject("MembershipService") private readonly membershipService: MembershipService,
    @inject("WalletService") private readonly walletService: WalletService,
    @inject("WalletValidator") private readonly walletValidator: WalletValidator,
    @inject("NotificationService") private readonly notificationService: NotificationService,
    @inject("ImageService") private readonly imageService: ImageService,
  ) {}

  // GCSアップロードはDBトランザクション外で実行（長時間ロック防止）
  // undefined = 変更なし（updateMetadata用）、null/[] = 画像なし
  private async uploadTransactionImages(
    images: GqlImageInput[] | null | undefined,
  ): Promise<Prisma.ImageCreateWithoutTransactionsInput[] | undefined> {
    if (images === undefined) return undefined;
    const results = await Promise.all(
      (images ?? []).map((img) => this.imageService.uploadPublicImage(img, "transactions")),
    );
    return results.filter((img): img is Prisma.ImageCreateWithoutTransactionsInput => img !== null);
  }

  async visitorBrowseTransactions(
    { filter, sort, cursor, first }: GqlQueryTransactionsArgs,
    ctx: IContext,
  ): Promise<GqlTransactionsConnection> {
    const take = clampFirst(first);
    const records = await this.transactionService.fetchTransactions(
      ctx,
      { filter, sort, cursor },
      take,
    );

    const hasNextPage = records.length > take;
    const data: GqlTransaction[] = records.slice(0, take).map((record) => {
      return TransactionPresenter.get(record);
    });
    return TransactionPresenter.query(data, hasNextPage, cursor);
  }

  async visitorViewTransaction(
    { id }: GqlQueryTransactionArgs,
    ctx: IContext,
  ): Promise<GqlTransaction | null> {
    const res = await this.transactionService.findTransaction(ctx, id);
    if (!res) {
      return null;
    }
    return TransactionPresenter.get(res);
  }

  async getTransactionChain(id: string, ctx: IContext) {
    const rows = await this.transactionService.getTransactionChain(ctx, id);
    if (!rows.length) return null;
    return TransactionPresenter.chain(rows);
  }

  async ownerIssueCommunityPoint(
    { input }: GqlMutationTransactionIssueCommunityPointArgs,
    ctx: IContext,
  ): Promise<GqlTransactionIssueCommunityPointPayload> {
    const communityId = getCommunityIdFromCtx(ctx);
    const communityWallet = await this.walletService.findCommunityWalletOrThrow(ctx, communityId);
    const uploadedImages = await this.uploadTransactionImages(input.images);

    const res = await ctx.issuer.onlyBelongingCommunity(
      ctx,
      async (tx: Prisma.TransactionClient) => {
        return await this.transactionService.issueCommunityPoint(
          ctx,
          input.transferPoints,
          communityWallet.id,
          tx,
          input.comment ?? undefined,
          uploadedImages,
        );
      },
    );
    await ctx.issuer.internal(async (tx) => {
      await this.transactionService.refreshCurrentPoint(ctx, tx);
    });
    return TransactionPresenter.issueCommunityPoint(res);
  }

  async ownerGrantCommunityPoint(
    ctx: IContext,
    { input }: GqlMutationTransactionGrantCommunityPointArgs,
  ): Promise<GqlTransactionGrantCommunityPointPayload> {
    const { toUserId, transferPoints, comment } = input;
    const currentUserId = getCurrentUserId(ctx);
    const communityId = getCommunityIdFromCtx(ctx);
    const communityWallet = await this.walletService.findCommunityWalletOrThrow(ctx, communityId);
    const uploadedImages = await this.uploadTransactionImages(input.images);

    const transaction = await ctx.issuer.onlyBelongingCommunity(
      ctx,
      async (tx: Prisma.TransactionClient) => {
        await this.membershipService.joinIfNeeded(ctx, currentUserId, communityId, tx, toUserId);
        const { toWalletId } = await this.walletValidator.validateCommunityMemberTransfer(
          ctx,
          tx,
          communityId,
          toUserId,
          transferPoints,
          TransactionReason.GRANT,
        );

        return await this.transactionService.grantCommunityPoint(
          ctx,
          transferPoints,
          communityWallet.id,
          toWalletId,
          tx,
          comment ?? undefined,
          uploadedImages,
        );
      },
    );

    await ctx.issuer.internal(async (tx) => {
      await this.transactionService.refreshCurrentPoint(ctx, tx);
    });

    this.notificationService
      .pushPointGrantReceivedMessage(ctx, transaction.id, toUserId)
      .catch((error) => {
        logger.error("Failed to send point grant notification", {
          transactionId: transaction.id,
          error,
        });
      });

    return TransactionPresenter.grantCommunityPoint(transaction);
  }

  async userDonateSelfPointToAnother(
    ctx: IContext,
    { input }: GqlMutationTransactionDonateSelfPointArgs,
  ): Promise<GqlTransactionDonateSelfPointPayload> {
    const { communityId, toUserId, transferPoints, comment } = input;
    const currentUserId = getCurrentUserId(ctx);
    const fromWallet = await this.walletService.findMemberWalletOrThrow(
      ctx,
      currentUserId,
      communityId,
    );
    const uploadedImages = await this.uploadTransactionImages(input.images);

    const transaction = await ctx.issuer.onlyBelongingCommunity(
      ctx,
      async (tx: Prisma.TransactionClient) => {
        const toWallet = await this.walletService.findMemberWalletOrThrow(
          ctx,
          toUserId,
          communityId,
          tx,
        );

        const { toWalletId } = await this.walletValidator.validateTransferMemberToMember(
          fromWallet,
          toWallet,
          transferPoints,
        );

        return await this.transactionService.donateSelfPoint(
          ctx,
          fromWallet.id,
          toWalletId,
          transferPoints,
          tx,
          comment ?? undefined,
          uploadedImages,
        );
      },
    );

    await ctx.issuer.internal(async (tx) => {
      await this.transactionService.refreshCurrentPoint(ctx, tx);
    });

    this.notificationService
      .pushPointDonationReceivedMessage(ctx, transaction.id, toUserId)
      .catch((error) => {
        logger.error("Failed to send point donation notification", {
          transactionId: transaction.id,
          error,
        });
      });

    return TransactionPresenter.giveUserPoint(transaction);
  }

  async userUpdateTransactionMetadata(
    ctx: IContext,
    { id, input }: GqlMutationTransactionUpdateMetadataArgs,
  ): Promise<GqlTransactionUpdateMetadataPayload> {
    const currentUserId = getCurrentUserId(ctx);

    const existing = await this.transactionService.findTransaction(ctx, id);
    if (!existing) {
      throw new NotFoundError(`TransactionNotFound: ID=${id}`);
    }

    // The @authz directive admits IsSelf OR IsCommunityOwner. Pick the
    // applicable authority here without relying on a client-supplied
    // mode flag: prefer owner-mode when the caller actually owns the
    // current community AND the txn was emitted from that community's
    // wallet, otherwise fall back to self-mode (caller is the creator).
    // SYS_ADMIN bypasses the wallet/creator checks entirely — admins are
    // a cross-community operations role and the IsCommunityOwner rule
    // already forced them to declare the operating community via the
    // x-community-id header.
    const ctxCommunityId = ctx.communityId;
    const isCreator = existing.createdBy === currentUserId;
    const isOwnerOfCtxCommunity =
      !!ctxCommunityId &&
      ctx.currentUser?.memberships?.some(
        (m) => m.communityId === ctxCommunityId && m.role === Role.OWNER,
      ) === true;

    if (ctx.isAdmin) {
      // admin はスコープ制限なし
    } else if (isOwnerOfCtxCommunity && ctxCommunityId) {
      const communityWallet = await this.walletService.findCommunityWalletOrThrow(
        ctx,
        ctxCommunityId,
      );
      if (existing.from !== communityWallet.id && !isCreator) {
        throw new AuthorizationError("Transaction is not from the community wallet");
      }
    } else if (!isCreator) {
      throw new AuthorizationError("Insufficient permissions to update transaction metadata");
    }

    // undefined = 変更なし、null/[] = 画像をクリア（GraphQL慣習）
    const uploadedImages = await this.uploadTransactionImages(input.images);

    const transaction = await ctx.issuer.onlyBelongingCommunity(
      ctx,
      async (tx: Prisma.TransactionClient) => {
        return this.transactionService.updateMetadata(ctx, id, input.comment, uploadedImages, tx);
      },
    );

    return TransactionPresenter.updateMetadata(transaction);
  }
}
