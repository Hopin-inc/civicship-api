import { Prisma, TransactionReason } from "@prisma/client";
import { IContext } from "@/types/server";
import TransactionPresenter from "@/application/domain/transaction/presenter";
import MembershipService from "@/application/domain/account/membership/service";
import WalletValidator from "@/application/domain/account/wallet/validator";
import WalletService from "@/application/domain/account/wallet/service";
import NotificationService from "@/application/domain/notification/service";
import CommunityService from "@/application/domain/account/community/service";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import { ITransactionService } from "@/application/domain/transaction/data/interface";
import logger from "@/infrastructure/logging";
import {
  GqlMutationRetrySignupBonusGrantArgs,
  GqlMutationSignupBonusRetryArgs,
  GqlMutationTransactionDonateSelfPointArgs,
  GqlMutationTransactionGrantCommunityPointArgs,
  GqlMutationTransactionIssueCommunityPointArgs,
  GqlQuerySignupBonusesArgs,
  GqlQueryTransactionArgs,
  GqlQueryTransactionsArgs,
  GqlSignupBonus,
  GqlSignupBonusRetryPayload,
  GqlTransaction,
  GqlTransactionDonateSelfPointPayload,
  GqlTransactionGrantCommunityPointPayload,
  GqlTransactionIssueCommunityPointPayload,
  GqlTransactionsConnection,
} from "@/types/graphql";
import { inject, injectable } from "tsyringe";
import { NotFoundError } from "@/errors/graphql";
import SignupBonusConfigService from "@/application/domain/account/community/config/incentive/signup/service";
import IncentiveGrantService from "@/application/domain/transaction/incentiveGrant/service";
import IncentiveGrantPresenter from "@/application/domain/transaction/incentiveGrant/presenter";

@injectable()
export default class TransactionUseCase {
  constructor(
    @inject("TransactionService") private readonly transactionService: ITransactionService,
    @inject("MembershipService") private readonly membershipService: MembershipService,
    @inject("WalletService") private readonly walletService: WalletService,
    @inject("WalletValidator") private readonly walletValidator: WalletValidator,
    @inject("NotificationService") private readonly notificationService: NotificationService,
    @inject("SignupBonusConfigService")
    private readonly signupBonusConfigService: SignupBonusConfigService,
    @inject("CommunityService") private readonly communityService: CommunityService,
    @inject("IncentiveGrantService")
    private readonly incentiveGrantService: IncentiveGrantService,
  ) {}

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
    await ctx.issuer.internal(async (tx) => {
      await this.transactionService.refreshCurrentPoint(ctx, tx);
    });
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

    const communityName = await this.communityService.getCommunityName(ctx, permission.communityId);

    await ctx.issuer.internal(async (tx) => {
      await this.transactionService.refreshCurrentPoint(ctx, tx);
    });
    
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
        comment,
      );
    });

    await ctx.issuer.internal(async (tx) => {
      await this.transactionService.refreshCurrentPoint(ctx, tx);
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

  async managerRetrySignupBonusGrant(
    { grantId }: GqlMutationRetrySignupBonusGrantArgs,
    ctx: IContext,
  ): Promise<GqlTransaction> {
    // STEP1: Load grant to get userId and communityId
    const grant = await this.transactionService.getGrantInfoForRetry(ctx, grantId);

    const { userId, communityId } = grant;

    // STEP2: Load config to get bonusPoint and message
    const config = await this.signupBonusConfigService.get(ctx, communityId);
    if (!config) {
      throw new NotFoundError("SignupBonusConfig not found for community", { communityId });
    }

    const { bonusPoint, message } = config;

    // STEP3: Get user's wallet in that community
    const wallet = await this.walletService.findMemberWalletOrThrow(ctx, userId, communityId);

    // STEP4: Call service to retry
    const result = await this.transactionService.retrySignupBonusGrant(ctx, {
      grantId,
      communityId,
      toWalletId: wallet.id,
      bonusPoint,
      message: message ?? undefined,
    });

    // STEP5: Handle result
    if (result.status === "FAILED") {
      logger.error("Signup bonus grant retry failed", {
        grantId,
        failureCode: result.failureCode,
        lastError: result.lastError,
      });
      throw new Error(
        `Failed to grant signup bonus: ${result.failureCode} - ${result.lastError || "Unknown error"}`,
      );
    }

    // Refresh points
    await ctx.issuer.internal(async (tx) => {
      await this.transactionService.refreshCurrentPoint(ctx, tx);
    });

    return TransactionPresenter.get(result.transaction);
  }

  async managerGetSignupBonuses(
    { communityId, filter, sort }: GqlQuerySignupBonusesArgs,
    ctx: IContext,
  ): Promise<GqlSignupBonus[]> {
    const grants = await this.incentiveGrantService.getSignupBonuses(
      ctx,
      communityId,
      filter,
      sort,
    );
    return grants.map(IncentiveGrantPresenter.toSignupBonus);
  }

  async managerRetrySignupBonus(
    { grantId }: GqlMutationSignupBonusRetryArgs,
    ctx: IContext,
  ): Promise<GqlSignupBonusRetryPayload> {
    // Get grant info
    const grant = await this.transactionService.getGrantInfoForRetry(ctx, grantId);
    const { userId, communityId } = grant;

    // Get config
    const config = await this.signupBonusConfigService.get(ctx, communityId);
    if (!config) {
      return {
        __typename: "SignupBonusRetryPayload",
        success: false,
        transaction: null,
        error: "Signup bonus config not found for community",
      };
    }

    // Get wallet
    const wallet = await this.walletService.findMemberWallet(ctx, userId, communityId);
    if (!wallet) {
      return {
        __typename: "SignupBonusRetryPayload",
        success: false,
        transaction: null,
        error: "Wallet not found for user",
      };
    }

    // Get community wallet
    const communityWallet = await this.walletService.findCommunityWalletOrThrow(ctx, communityId);

    // Retry
    const result = await this.incentiveGrantService.retrySignupBonus(ctx, {
      grantId,
      fromWalletId: communityWallet.id,
      toWalletId: wallet.id,
      bonusPoint: config.bonusPoint,
      message: config.message ?? undefined,
    });

    return {
      __typename: "SignupBonusRetryPayload",
      success: result.success,
      transaction: result.transaction || null,
      error: result.error || null,
    };
  }
}
