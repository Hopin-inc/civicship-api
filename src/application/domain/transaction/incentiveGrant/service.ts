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
import {
  PrismaIncentiveGrantDetail,
  PrismaIncentiveGrantWithTransaction,
  StalePendingGrantResult,
} from "@/application/domain/transaction/incentiveGrant/data/type";
import { injectable, inject } from "tsyringe";
import { IIncentiveGrantRepository } from "@/application/domain/transaction/incentiveGrant/data/interface";
import { ITransactionRepository } from "../data/interface";
import TransactionConverter from "../data/converter";
import IncentiveGrantConverter from "./data/converter";
import { determineFailureCode } from "../util/failureCodeResolver";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import logger from "@/infrastructure/logging";
import WalletService from "@/application/domain/account/wallet/service";
import SignupBonusConfigService from "@/application/domain/account/community/config/incentive/signup/service";
import { GqlSignupBonusFilterInput, GqlSignupBonusSortInput } from "@/types/graphql";

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

  async grantSignupBonus(
    ctx: IContext,
    args: {
      userId: string;
      communityId: string;
      toWalletId: string;
      bonusPoint: number;
      message?: string;
    },
  ): Promise<GrantSignupBonusResult> {
    const { userId, communityId, toWalletId, bonusPoint, message } = args;

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

    const grantId = grantOrResult;

    return this.executeSignupBonusGrant(ctx, {
      grantId,
      toWalletId,
      bonusPoint,
      message,
    });
  }

  async retrySignupBonusGrant(
    ctx: IContext,
    args: {
      grantId: string;
      toWalletId: string;
      bonusPoint: number;
      message?: string;
    },
  ): Promise<Extract<GrantSignupBonusResult, { status: "COMPLETED" | "FAILED" }>> {
    const { grantId, toWalletId, bonusPoint, message } = args;

    await this.resetGrantToPending(ctx, grantId);

    return this.executeSignupBonusGrant(ctx, {
      grantId,
      toWalletId,
      bonusPoint,
      message,
    });
  }

  async findStalePendingGrants(
    ctx: IContext,
    thresholdMinutes: number = 30,
  ): Promise<StalePendingGrantResult[]> {
    const threshold = new Date(Date.now() - thresholdMinutes * 60 * 1000);

    const staleGrants = await ctx.issuer.public(ctx, (tx) =>
      this.incentiveGrantRepository.findStalePendingGrants(ctx, tx, threshold),
    );

    if (staleGrants.length > 0) {
      logger.warn("Found stale PENDING signup bonus grants", {
        count: staleGrants.length,
        thresholdMinutes,
        oldestGrant: staleGrants[0],
      });
    }

    return staleGrants;
  }

  async getGrantInfoForRetry(
    ctx: IContext,
    grantId: string,
  ): Promise<{
    userId: string;
    communityId: string;
    status: string;
  }> {
    const grant = await ctx.issuer.public(ctx, (tx) =>
      this.incentiveGrantRepository.findById(ctx, tx, grantId),
    );

    if (!grant) {
      throw new NotFoundError("IncentiveGrant", { grantId });
    }

    return {
      userId: grant.userId,
      communityId: grant.communityId,
      status: grant.status,
    };
  }

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
      logger.error("Grant not found after P2002 (integrity violation)", {
        userId,
        communityId,
        type,
        sourceId,
      });
      throw new Error("Grant not found after P2002 (should never happen)");
    }

    if (existing.status === IncentiveGrantStatus.COMPLETED) {
      if (existing.transactionId && existing.transaction) {
        return {
          status: "SKIPPED_ALREADY_COMPLETED" as const,
          transaction: existing.transaction,
        };
      } else {
        logger.error("DATA CORRUPTION: Grant is COMPLETED but transaction is null", {
          grantId: existing.id,
          userId,
          communityId,
          type,
          sourceId,
          transactionId: existing.transactionId,
          hasTransaction: !!existing.transaction,
        });

        return {
          status: "FAILED" as const,
          grantId: existing.id,
          failureCode: IncentiveGrantFailureCode.UNKNOWN,
          lastError: "DATA CORRUPTION: Grant marked COMPLETED but transaction is null",
        };
      }
    } else if (existing.status === IncentiveGrantStatus.PENDING) {
      return {
        status: "SKIPPED_PENDING" as const,
        grantId: existing.id,
      };
    } else if (existing.status === IncentiveGrantStatus.FAILED) {
      return {
        status: "FAILED" as const,
        grantId: existing.id,
        failureCode: existing.failureCode ?? IncentiveGrantFailureCode.UNKNOWN,
        lastError: existing.lastError ?? undefined,
      };
    }

    throw new Error(`Unexpected grant status: ${existing.status}`);
  }

  private async executeSignupBonusGrant(
    ctx: IContext,
    args: {
      grantId: string;
      toWalletId: string;
      bonusPoint: number;
      message?: string;
    },
  ): Promise<Extract<GrantSignupBonusResult, { status: "COMPLETED" | "FAILED" }>> {
    const { grantId, toWalletId, bonusPoint, message } = args;

    const grantCheck = await ctx.issuer.public(ctx, (tx) =>
      this.incentiveGrantRepository.findById(ctx, tx, grantId),
    );

    if (!grantCheck) {
      throw new NotFoundError("IncentiveGrant", { grantId });
    }

    if (grantCheck.transactionId && grantCheck.transaction) {
      logger.info("Transaction already exists for grant (idempotent return)", {
        grantId,
        transactionId: grantCheck.transactionId,
      });

      return { status: "COMPLETED", transaction: grantCheck.transaction };
    }

    try {
      const transaction = await ctx.issuer.public(ctx, async (tx) => {
        const transactionData = this.transactionConverter.signupBonus(toWalletId, bonusPoint, message);

        const transaction = await this.transactionRepository.create(ctx, transactionData, tx);

        await this.incentiveGrantRepository.markAsCompleted(ctx, tx, grantId, transaction.id);

        return transaction;
      });

      return { status: "COMPLETED", transaction };
    } catch (error) {
      return this.handleTransactionCreationError(ctx, grantId, error);
    }
  }

  /**
   * Get signup bonus grants
   */
  async getSignupBonuses(
    ctx: IContext,
    communityId: string,
    filter?: GqlSignupBonusFilterInput | null,
    sort?: GqlSignupBonusSortInput | null,
  ): Promise<PrismaIncentiveGrantDetail[]> {
    const where = this.incentiveGrantConverter.filter(communityId, filter);
    const orderBy = this.incentiveGrantConverter.sort(sort);

    return this.incentiveGrantRepository.find(ctx, where, orderBy);
  }

  /**
   * Retry a failed signup bonus grant
   */
  async retrySignupBonus(
    ctx: IContext,
    grantId: string,
  ): Promise<{
    success: boolean;
    transaction?: PrismaTransactionDetail;
    error?: string;
  }> {
    const grant = await ctx.issuer.public(ctx, (tx) =>
      this.incentiveGrantRepository.findById(ctx, tx, grantId),
    );

    if (!grant) {
      return { success: false, error: "Grant not found" };
    }

    if (grant.status !== IncentiveGrantStatus.FAILED) {
      return {
        success: false,
        error: `Grant is not in FAILED status (current: ${grant.status})`,
      };
    }

    const wallet = await this.walletService.findMemberWallet(ctx, grant.userId, grant.communityId);
    if (!wallet) {
      return { success: false, error: "Wallet not found for user" };
    }

    const config = await this.signupBonusConfigService.get(ctx, grant.communityId);
    if (!config || !config.isEnabled) {
      return { success: false, error: "Signup bonus is not enabled for this community" };
    }

    try {
      const result = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
        await this.incentiveGrantRepository.resetToPending(ctx, tx, grantId);

        return await this.grantSignupBonus(ctx, {
          userId: grant.userId,
          communityId: grant.communityId,
          toWalletId: wallet.id,
          bonusPoint: config.bonusPoint,
          message: config.message ?? undefined,
        });
      });

      if (result.status === "COMPLETED") {
        return { success: true, transaction: result.transaction };
      }

      return { success: false, error: `Grant ended in ${result.status} status` };
    } catch (error) {
      logger.error("Failed to retry signup bonus", {
        grantId,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async handleTransactionCreationError(
    ctx: IContext,
    grantId: string,
    error: unknown,
  ): Promise<Extract<GrantSignupBonusResult, { status: "FAILED" }>> {
    const failureCode = determineFailureCode(error);
    const lastError = error instanceof Error ? error.message : String(error);

    await this.markGrantAsFailed(ctx, grantId, failureCode, lastError);

    logger.error("Signup bonus grant execution failed", {
      grantId,
      failureCode,
      lastError,
    });

    return { status: "FAILED", grantId, failureCode, lastError };
  }

  private async markGrantAsFailed(
    ctx: IContext,
    grantId: string,
    failureCode: IncentiveGrantFailureCode,
    lastError?: string,
  ): Promise<void> {
    try {
      await ctx.issuer.public(ctx, async (tx) => {
        await this.incentiveGrantRepository.markAsFailed(ctx, tx, grantId, failureCode, lastError);
      });
    } catch (updateError) {
      logger.error("Failed to mark grant as FAILED", {
        grantId,
        originalFailureCode: failureCode,
        originalError: lastError,
        updateError,
      });
    }
  }

  private async resetGrantToPending(ctx: IContext, grantId: string): Promise<void> {
    const STALE_PENDING_THRESHOLD_MINUTES = 5;

    await ctx.issuer.public(ctx, async (tx) => {
      const grant = await this.incentiveGrantRepository.findById(ctx, tx, grantId);

      if (!grant) {
        throw new NotFoundError("IncentiveGrant", { grantId });
      }

      if (grant.status === IncentiveGrantStatus.FAILED) {
        await this.incentiveGrantRepository.resetToPending(ctx, tx, grantId);
        return;
      }

      if (grant.status === IncentiveGrantStatus.PENDING) {
        await this.handlePendingGrantReset(
          ctx,
          tx,
          grant,
          grantId,
          STALE_PENDING_THRESHOLD_MINUTES,
        );
        return;
      }

      throw new ValidationError("COMPLETED grants cannot be retried", [grantId]);
    });
  }

  private async handlePendingGrantReset(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    grant: PrismaIncentiveGrantWithTransaction,
    grantId: string,
    thresholdMinutes: number,
  ): Promise<void> {
    const threshold = new Date(Date.now() - thresholdMinutes * 60 * 1000);

    if (grant.lastAttemptedAt < threshold) {
      logger.info("Resetting stale PENDING grant for manual retry", {
        grantId,
        lastAttemptedAt: grant.lastAttemptedAt,
        thresholdMinutes,
      });

      await this.incentiveGrantRepository.resetToPending(ctx, tx, grantId);
    } else {
      throw new ValidationError(
        "PENDING grant is too recent for manual retry (wait for batch cleanup or concurrent execution to finish)",
        [grantId],
      );
    }
  }
}
