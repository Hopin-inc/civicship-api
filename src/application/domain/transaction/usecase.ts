import { Prisma, TransactionReason } from "@prisma/client";
import { IContext } from "@/types/server";
import TransactionPresenter from "@/application/domain/transaction/presenter";
import MembershipService from "@/application/domain/account/membership/service";
import WalletValidator from "@/application/domain/account/wallet/validator";
import WalletService from "@/application/domain/account/wallet/service";
import NotificationService from "@/application/domain/notification/service";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import { ITransactionService } from "@/application/domain/transaction/data/interface";
import logger from "@/infrastructure/logging";
import {
  GqlMutationTransactionDonateSelfPointArgs,
  GqlMutationTransactionGrantCommunityPointArgs,
  GqlMutationTransactionIssueCommunityPointArgs,
  GqlQueryTransactionArgs,
  GqlQueryTransactionsArgs,
  GqlTransaction,
  GqlTransactionDonateSelfPointPayload,
  GqlTransactionGrantCommunityPointPayload,
  GqlTransactionIssueCommunityPointPayload,
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
  ) { }

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

  async ownerIssueCommunityPoint(
    { input, permission }: GqlMutationTransactionIssueCommunityPointArgs,
    ctx: IContext,
  ): Promise<GqlTransactionIssueCommunityPointPayload> {
    const communityWallet = await this.walletService.findCommunityWalletOrThrow(
      ctx,
      permission.communityId,
    );
    const res = await ctx.issuer.onlyBelongingCommunity(
      ctx,
      async (tx: Prisma.TransactionClient) => {
        return await this.transactionService.issueCommunityPoint(
          ctx,
          input.transferPoints,
          communityWallet.id,
          tx,
          input.comment,
        );
      },
    );
    return TransactionPresenter.issueCommunityPoint(res);
  }

  async ownerGrantCommunityPoint(
    ctx: IContext,
    { input, permission }: GqlMutationTransactionGrantCommunityPointArgs,
  ): Promise<GqlTransactionGrantCommunityPointPayload> {
    const { toUserId, transferPoints, comment } = input;
    const currentUserId = getCurrentUserId(ctx);
    const communityWallet = await this.walletService.findCommunityWalletOrThrow(
      ctx,
      permission.communityId,
    );

    const transaction = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx: Prisma.TransactionClient) => {
      await this.membershipService.joinIfNeeded(
        ctx,
        currentUserId,
        permission.communityId,
        tx,
        toUserId,
      );
      const { toWalletId } = await this.walletValidator.validateCommunityMemberTransfer(
        ctx,
        tx,
        permission.communityId,
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
        comment,
      );
    });

    const community = await ctx.issuer.internal(async (tx) => {
      return tx.community.findUnique({
        where: { id: permission.communityId },
        select: { name: true },
      });
    });

    const communityName = community?.name ?? "コミュニティ";
    this.notificationService
      .pushPointGrantReceivedMessage(
        ctx,
        transaction.id,
        transaction.toPointChange,
        transaction.comment,
        communityName,
        toUserId,
      )
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

    const transaction = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx: Prisma.TransactionClient) => {
      const toWallet = await this.walletService.findMemberWalletOrThrow(
        ctx,
        toUserId,
        communityId,
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
        comment,
      );
    });

    const fromUserName = ctx.currentUser?.name ?? "ユーザー";
    this.notificationService
      .pushPointDonationReceivedMessage(
        ctx,
        transaction.id,
        transaction.toPointChange,
        transaction.comment,
        fromUserName,
        toUserId,
      )
      .catch((error) => {
        logger.error("Failed to send point donation notification", {
          transactionId: transaction.id,
          error,
        });
      });

    return TransactionPresenter.giveUserPoint(transaction);
  }
}
