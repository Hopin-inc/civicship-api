import { IContext } from "@/types/server";
import { GrantSignupBonusResult } from "@/application/domain/transaction/data/type";
import { StalePendingGrantResult } from "@/application/domain/transaction/incentiveGrant/data/type";

/**
 * Service interface for IncentiveGrant operations
 */
export interface IIncentiveGrantService {
  /**
   * Grant signup bonus with complete transaction separation for safety.
   *
   * CRITICAL DESIGN:
   * - Uses separate transactions to avoid PostgreSQL abort state issues
   * - Returns Result type (never throws) to preserve FAILED state
   * - Grant-first pattern ensures idempotency
   *
   * @returns Result object (COMPLETED | SKIPPED_ALREADY_COMPLETED | SKIPPED_PENDING | FAILED)
   */
  grantSignupBonus(
    ctx: IContext,
    args: {
      userId: string;
      communityId: string;
      fromWalletId: string;
      toWalletId: string;
      bonusPoint: number;
      message?: string;
    },
  ): Promise<GrantSignupBonusResult>;

  /**
   * Retry failed signup bonus grant (public method for UseCase).
   * Resets grant to PENDING and re-executes.
   *
   * @returns Result (COMPLETED or FAILED)
   */
  retrySignupBonusGrant(
    ctx: IContext,
    args: {
      grantId: string;
      fromWalletId: string;
      toWalletId: string;
      bonusPoint: number;
      message?: string;
    },
  ): Promise<Extract<GrantSignupBonusResult, { status: "COMPLETED" | "FAILED" }>>;

  /**
   * Find stale PENDING grants for monitoring and cleanup.
   * Returns grants that have been in PENDING state for longer than the threshold.
   *
   * This can be called:
   * 1. Via a cron job to automatically log/alert on stuck grants
   * 2. Via an admin mutation to manually check status
   * 3. As input to an automated cleanup process
   *
   * @param thresholdMinutes - How old a PENDING grant must be to be considered stale (default: 30 minutes)
   */
  findStalePendingGrants(
    ctx: IContext,
    thresholdMinutes?: number,
  ): Promise<StalePendingGrantResult[]>;

  /**
   * Get grant information for retry operations.
   * Returns essential grant data needed for retry (userId, communityId, status).
   *
   * @param grantId - Grant ID to retrieve
   * @returns Grant info with userId, communityId, status
   * @throws NotFoundError if grant doesn't exist
   */
  getGrantInfoForRetry(
    ctx: IContext,
    grantId: string,
  ): Promise<{
    userId: string;
    communityId: string;
    status: string;
  }>;

  /**
   * Create a failed signup bonus grant record without attempting transaction.
   * Used when pre-validation fails (e.g., insufficient balance check in UseCase layer).
   *
   * @param args - Contains userId, communityId, failureCode, and lastError
   */
  createFailedSignupBonusGrant(
    ctx: IContext,
    args: {
      userId: string;
      communityId: string;
      failureCode: import("@prisma/client").IncentiveGrantFailureCode;
      lastError: string;
    },
  ): Promise<void>;
}
