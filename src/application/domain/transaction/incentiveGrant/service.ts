import {
  IncentiveGrantFailureCode,
  IncentiveGrantStatus,
  IncentiveGrantType,
  Prisma,
} from "@prisma/client";
import { IContext } from "@/types/server";
import { IIncentiveGrantService } from "./interface";
import {
  GrantSignupBonusResult,
  PrismaTransactionDetail,
} from "@/application/domain/transaction/data/type";
import { PrismaIncentiveGrantDetail } from "@/application/domain/transaction/incentiveGrant/data/type";
import { injectable, inject } from "tsyringe";
import { IIncentiveGrantRepository } from "@/application/domain/transaction/incentiveGrant/data/interface";
import { ITransactionRepository } from "../data/interface";
import TransactionConverter from "../data/converter";
import IncentiveGrantConverter from "./data/converter";
import { determineFailureCode } from "../util/failureCodeResolver";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import logger from "@/infrastructure/logging";
import { GqlSignupBonusFilterInput, GqlSignupBonusSortInput } from "@/types/graphql";
import WalletService from "@/application/domain/account/wallet/service";
import SignupBonusConfigService from "@/application/domain/account/community/config/incentive/signup/service";

const SIGNUP_SOURCE_ID = "default";

@injectable()
export default class IncentiveGrantService implements IIncentiveGrantService {
  constructor(
    @inject("IncentiveGrantRepository")
    private readonly incentiveGrantRepository: IIncentiveGrantRepository,
    @inject("TransactionRepository") private readonly transactionRepository: ITransactionRepository,
    @inject("TransactionConverter") private readonly transactionConverter: TransactionConverter,
    @inject("IncentiveGrantConverter")
    private readonly incentiveGrantConverter: IncentiveGrantConverter,
    @inject("WalletService") private readonly walletService: WalletService,
    @inject("SignupBonusConfigService")
    private readonly signupBonusConfigService: SignupBonusConfigService,
  ) {}

  /**
   * Grant signup bonus if enabled (best-effort pattern).
   *
   * This method orchestrates the entire signup bonus flow:
   * 1. Check if signup bonus is enabled for the community
   * 2. Validate wallet existence (member + community)
   * 3. Grant signup bonus (with real-time balance check inside transaction)
   *
   * Errors are logged but not propagated - user signup should always succeed.
   */
  async grantSignupBonusIfEnabledBestEffort(
    ctx: IContext,
    userId: string,
    communityId: string,
  ): Promise<void> {
    try {
      // 1. Check if signup bonus is enabled
      const config = await this.signupBonusConfigService.get(ctx, communityId);
      if (!config?.isEnabled) {
        logger.debug("Signup bonus not enabled for community", { communityId });
        return;
      }

      // 2. Get wallets in parallel
      const [memberWallet, communityWallet] = await Promise.all([
        this.walletService.findMemberWallet(ctx, userId, communityId),
        this.walletService.findCommunityWalletOrThrow(ctx, communityId),
      ]);

      if (!memberWallet) {
        logger.warn("Member wallet not found for signup bonus (wallet creation may have failed)", {
          userId,
          communityId,
        });
        return;
      }

      // 3. Grant signup bonus (balance check happens inside transaction)
      await this.grantSignupBonus(ctx, {
        userId,
        communityId,
        fromWalletId: communityWallet.id,
        toWalletId: memberWallet.id,
        bonusPoint: config.bonusPoint,
        message: config.message ?? undefined,
      });
    } catch (error) {
      // Best-effort: log error but don't fail user signup
      logger.error("Unexpected error during signup bonus grant", {
        userId,
        communityId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  /**
   * 冪等性を担保したポイント付与の実行
   */
  async grantSignupBonus(
    ctx: IContext,
    args: {
      userId: string;
      communityId: string;
      fromWalletId: string;
      toWalletId: string;
      bonusPoint: number;
      message?: string;
    },
  ): Promise<GrantSignupBonusResult> {
    const { userId, communityId, fromWalletId, toWalletId, bonusPoint, message } = args;

    // 特典レコードの確保 (P2002によるロック)
    const grantOrResult = await this.acquireIncentiveGrant(
      ctx,
      userId,
      communityId,
      IncentiveGrantType.SIGNUP,
      SIGNUP_SOURCE_ID,
    );

    if (typeof grantOrResult !== "string") {
      return grantOrResult;
    }

    return this.executeSignupBonusGrant(ctx, {
      grantId: grantOrResult,
      fromWalletId,
      toWalletId,
      bonusPoint,
      message,
    });
  }

  // --- プライベート・ハンドリング・ロジック ---

  private async acquireIncentiveGrant(
    ctx: IContext,
    userId: string,
    communityId: string,
    type: IncentiveGrantType,
    sourceId: string,
  ): Promise<string | GrantSignupBonusResult> {
    return ctx.issuer.public(ctx, async (tx) => {
      try {
        const grant = await this.incentiveGrantRepository.create(ctx, tx, {
          userId,
          communityId,
          type,
          sourceId,
        });
        return grant.id;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          return this.handleExistingGrant(ctx, tx, userId, communityId, type, sourceId);
        }
        throw error;
      }
    });
  }

  private async handleExistingGrant(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    userId: string,
    communityId: string,
    type: IncentiveGrantType,
    sourceId: string,
  ): Promise<GrantSignupBonusResult> {
    const existing = await this.incentiveGrantRepository.findByUnique(ctx, tx, {
      userId,
      communityId,
      type,
      sourceId,
    });

    if (!existing) {
      throw new Error("Grant not found after P2002 (integrity violation)");
    }

    switch (existing.status) {
      case IncentiveGrantStatus.COMPLETED:
        return existing.transaction
          ? { status: "SKIPPED_ALREADY_COMPLETED", transaction: existing.transaction }
          : this.handleDataCorruption(existing.id);

      case IncentiveGrantStatus.PENDING:
        return { status: "SKIPPED_PENDING", grantId: existing.id };

      case IncentiveGrantStatus.FAILED:
        return {
          status: "FAILED",
          grantId: existing.id,
          failureCode: existing.failureCode ?? IncentiveGrantFailureCode.UNKNOWN,
          lastError: existing.lastError ?? undefined,
        };

      default:
        throw new Error(`Unexpected grant status: ${existing.status}`);
    }
  }

  private async executeSignupBonusGrant(
    ctx: IContext,
    args: {
      grantId: string;
      fromWalletId: string;
      toWalletId: string;
      bonusPoint: number;
      message?: string;
    },
  ): Promise<Extract<GrantSignupBonusResult, { status: "COMPLETED" | "FAILED" }>> {
    const { grantId, fromWalletId, toWalletId, bonusPoint, message } = args;

    const grantCheck = await ctx.issuer.public(ctx, (tx) =>
      this.incentiveGrantRepository.findById(ctx, tx, grantId),
    );

    if (!grantCheck) throw new NotFoundError("IncentiveGrant", { grantId });

    // 既に完了している場合の二重実行防止
    if (grantCheck.transactionId && grantCheck.transaction) {
      return { status: "COMPLETED", transaction: grantCheck.transaction };
    }

    try {
      const transaction = await ctx.issuer.public(ctx, async (tx) => {
        // トランザクション内での厳密な残高チェック (TOCTOU対策)
        await this.walletService.checkCommunityWalletBalanceInTransaction(
          ctx,
          grantCheck.communityId,
          bonusPoint,
          tx,
        );

        const data = this.transactionConverter.signupBonus(
          fromWalletId,
          toWalletId,
          bonusPoint,
          message,
        );
        const newTx = await this.transactionRepository.create(ctx, data, tx);
        await this.incentiveGrantRepository.markAsCompleted(ctx, tx, grantId, newTx.id);

        return newTx;
      });

      return { status: "COMPLETED", transaction };
    } catch (error) {
      return this.handleTransactionCreationError(ctx, grantId, error);
    }
  }

  // --- ヘルパーメソッド ---

  private handleDataCorruption(grantId: string): GrantSignupBonusResult {
    logger.error("DATA CORRUPTION: Grant is COMPLETED but transaction is null", { grantId });
    return {
      status: "FAILED",
      grantId,
      failureCode: IncentiveGrantFailureCode.UNKNOWN,
      lastError: "DATA CORRUPTION: Grant marked COMPLETED but transaction is null",
    };
  }

  // --- その他サポートメソッド (リトライ・取得など) ---

  async createFailedSignupBonusGrant(
    ctx: IContext,
    args: {
      userId: string;
      communityId: string;
      failureCode: IncentiveGrantFailureCode;
      lastError: string;
    },
  ): Promise<void> {
    const { userId, communityId, failureCode, lastError } = args;
    await ctx.issuer.public(ctx, async (tx) => {
      try {
        const grant = await this.incentiveGrantRepository.create(ctx, tx, {
          userId,
          communityId,
          type: IncentiveGrantType.SIGNUP,
          sourceId: SIGNUP_SOURCE_ID,
        });
        await this.incentiveGrantRepository.markAsFailed(ctx, tx, grant.id, failureCode, lastError);
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return;
        throw error;
      }
    });
  }

  async retrySignupBonus(
    ctx: IContext,
    args: {
      grantId: string;
      fromWalletId: string;
      toWalletId: string;
      bonusPoint: number;
      message?: string;
    },
  ): Promise<{ success: boolean; transaction?: PrismaTransactionDetail; error?: string }> {
    try {
      await this.resetGrantToPending(ctx, args.grantId);
      const result = await this.executeSignupBonusGrant(ctx, args);
      return result.status === "COMPLETED"
        ? { success: true, transaction: result.transaction }
        : { success: false, error: `Grant ended in ${result.status} status` };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  private async resetGrantToPending(ctx: IContext, grantId: string): Promise<void> {
    await ctx.issuer.public(ctx, async (tx) => {
      const grant = await this.incentiveGrantRepository.findById(ctx, tx, grantId);
      if (!grant) throw new NotFoundError("IncentiveGrant", { grantId });
      if (grant.status === IncentiveGrantStatus.COMPLETED)
        throw new ValidationError("COMPLETED grants cannot be retried", [grantId]);

      await this.incentiveGrantRepository.resetToPending(ctx, tx, grantId);
    });
  }

  async getSignupBonuses(
    ctx: IContext,
    communityId: string,
    filter?: GqlSignupBonusFilterInput | null,
    sort?: GqlSignupBonusSortInput | null,
  ): Promise<PrismaIncentiveGrantDetail[]> {
    const where = this.incentiveGrantConverter.filter(communityId, filter);
    const orderBy = this.incentiveGrantConverter.sort(sort);
    const res = await this.incentiveGrantRepository.find(ctx, where, orderBy);
    console.log(res);
    return res;
  }

  private async handleTransactionCreationError(
    ctx: IContext,
    grantId: string,
    error: unknown,
  ): Promise<Extract<GrantSignupBonusResult, { status: "FAILED" }>> {
    const failureCode = determineFailureCode(error);
    const lastError = error instanceof Error ? error.message : String(error);
    await ctx.issuer.public(ctx, (tx) =>
      this.incentiveGrantRepository.markAsFailed(ctx, tx, grantId, failureCode, lastError),
    );
    return { status: "FAILED", grantId, failureCode, lastError };
  }
}
