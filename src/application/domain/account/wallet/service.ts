import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { GqlQueryWalletsArgs } from "@/types/graphql";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import WalletConverter from "@/application/domain/account/wallet/data/converter";
import { IWalletRepository } from "@/application/domain/account/wallet/data/interface";
import { inject, injectable } from "tsyringe";
import { PrismaWallet, PrismaWalletDetail } from "@/application/domain/account/wallet/data/type";
import { ITransactionRepository } from "@/application/domain/transaction/data/interface";
import logger from "@/infrastructure/logging";

@injectable()
export default class WalletService {
  constructor(
    @inject("WalletRepository") private readonly repository: IWalletRepository,
    @inject("WalletConverter") private readonly converter: WalletConverter,
    @inject("TransactionRepository") private readonly transactionRepository: ITransactionRepository,
  ) { }

  async fetchWallets(ctx: IContext, { filter, sort, cursor }: GqlQueryWalletsArgs, take: number) {
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});

    return this.repository.query(ctx, where, orderBy, take, cursor);
  }

  async findWallet(ctx: IContext, id: string) {
    return this.repository.find(ctx, id);
  }

  async findMemberWallet(ctx: IContext, userId: string, communityId: string, tx?: Prisma.TransactionClient) {
    return this.repository.findFirstExistingMemberWallet(ctx, communityId, userId, tx);
  }

  async findMemberWalletOrThrow(ctx: IContext, userId: string, communityId: string, tx?: Prisma.TransactionClient, retried: boolean = false) {
    const wallet = await this.repository.findFirstExistingMemberWallet(ctx, communityId, userId, tx);
    if (!wallet) {
      throw new NotFoundError("Member wallet", { userId, communityId });
    }
    const refreshed = await this.refreshCurrentPointViewIfNotExist(ctx, wallet);
    return refreshed && !retried
      ? await this.findMemberWalletOrThrow(ctx, userId, communityId, tx, true)
      : wallet;
  }

  async findCommunityWalletOrThrow(ctx: IContext, communityId: string, tx?: Prisma.TransactionClient) {
    const wallet = await this.repository.findCommunityWallet(ctx, communityId, tx);
    if (!wallet?.id) {
      throw new NotFoundError("Community wallet", { communityId });
    }
    return wallet;
  }

  async checkIfMemberWalletExists(ctx: IContext, memberWalletId: string) {
    const wallet = await this.repository.find(ctx, memberWalletId);
    if (!wallet) {
      throw new NotFoundError("Member wallet", { memberWalletId });
    }
    return wallet;
  }

  async createCommunityWallet(ctx: IContext, communityId: string, tx: Prisma.TransactionClient) {
    const data: Prisma.WalletCreateInput = this.converter.createCommunityWallet({
      communityId,
    });
    return this.repository.create(ctx, data, tx);
  }

  async createMemberWalletIfNeeded(
    ctx: IContext,
    userId: string,
    communityId: string,
    tx: Prisma.TransactionClient,
  ) {
    const existingWallet = await this.repository.findFirstExistingMemberWallet(
      ctx,
      communityId,
      userId,
      tx,
    );
    if (existingWallet) {
      return existingWallet;
    }

    const data: Prisma.WalletCreateInput = this.converter.createMemberWallet({
      userId,
      communityId,
    });
    return this.repository.create(ctx, data, tx);
  }

  async deleteMemberWallet(
    ctx: IContext,
    userId: string,
    communityId: string,
    tx: Prisma.TransactionClient,
  ) {
    const memberWallet = await this.findMemberWalletOrThrow(ctx, userId, communityId, tx);
    return this.repository.delete(ctx, memberWallet.id, tx);
  }

  /**
   * Refreshes the materialized view for current points if it doesn't exist.
   * 
   * IMPORTANT: This method intentionally runs in a SEPARATE transaction with RLS bypass,
   * even when called from within a parent transaction. This is by design because:
   * 
   * 1. RLS Bypass Required: The materialized view refresh must run with app.rls_bypass='on'
   *    to update system-wide derived state. Parent transactions (onlyBelongingCommunity)
   *    have app.rls_bypass='off', so passing the parent tx would break the refresh.
   * 
   * 2. Performance & Lock Isolation: Refreshing a materialized view is expensive and can
   *    take significant time. Running it inside the parent business transaction would:
   *    - Extend lock duration and increase deadlock risk
   *    - Block the critical path of the business transaction
   *    - Reduce throughput under load
   * 
   * 3. Eventual Consistency: The re-fetch pattern (with retried flag) handles the case
   *    where the refresh hasn't completed yet. We accept eventual consistency here.
   * 
   * When switching to set_config(..., TRUE), this pattern remains correct and necessary.
   * 
   * @param ctx - The context
   * @param wallet - The wallet to check
   * @returns true if refresh was triggered, false if currentPointView already exists
   */
  private async refreshCurrentPointViewIfNotExist(ctx: IContext, wallet: PrismaWallet) {
    if (wallet.currentPointView === null) {
      await ctx.issuer.public(ctx, tx => {
        return this.transactionRepository.refreshCurrentPoints(ctx, tx);
      });
      return true;
    } else return false;
  }

  /**
   * サインアップボーナス付与のためのウォレット検証
   * - メンバーウォレット存在確認
   * - コミュニティウォレット残高確認
   *
   * NOTE: This is a pre-check outside transaction. The actual balance check
   * must be done inside transaction using checkCommunityWalletBalanceInTransaction.
   */
  async validateForSignupBonus(
    ctx: IContext,
    userId: string,
    communityId: string,
    requiredAmount: number,
  ): Promise<{
    valid: boolean;
    wallet?: PrismaWallet;
    communityWallet?: PrismaWalletDetail;
    reason?: 'wallet_not_found' | 'insufficient_balance';
    currentBalance?: string;
  }> {
    // メンバーウォレット確認
    const wallet = await this.findMemberWallet(ctx, userId, communityId);
    if (!wallet) {
      return { valid: false, reason: 'wallet_not_found' };
    }

    // コミュニティウォレット残高確認
    try {
      const communityWallet = await this.findCommunityWalletOrThrow(ctx, communityId);
      const { currentPoint } = communityWallet.currentPointView || {};

      if (currentPoint == null) {
        return { valid: true, wallet, communityWallet }; // 不明時は続行
      }

      if (currentPoint < BigInt(requiredAmount)) {
        return {
          valid: false,
          wallet,
          communityWallet,
          reason: 'insufficient_balance',
          currentBalance: currentPoint.toString(),
        };
      }

      return { valid: true, wallet, communityWallet };
    } catch (error) {
      logger.warn("Failed to check community wallet balance", {
        communityId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      return { valid: true, wallet }; // エラー時は続行（communityWalletなし）
    }
  }

  /**
   * Check community wallet balance inside transaction (TOCTOU-safe).
   * Throws ValidationError if insufficient balance.
   *
   * @param ctx - Context
   * @param communityId - Community ID
   * @param requiredAmount - Required amount
   * @param tx - Transaction client (required)
   * @throws ValidationError if insufficient balance
   */
  async checkCommunityWalletBalanceInTransaction(
    ctx: IContext,
    communityId: string,
    requiredAmount: number,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const communityWallet = await this.repository.findCommunityWallet(ctx, communityId, tx);

    if (!communityWallet?.id) {
      throw new NotFoundError("Community wallet", { communityId });
    }

    const { currentPoint } = communityWallet.currentPointView || {};

    // Treat null as 0pt (no transactions yet or materialized view not refreshed)
    const currentBalance = currentPoint ?? BigInt(0);

    logger.debug("Checking community wallet balance in transaction", {
      communityId,
      walletId: communityWallet.id,
      currentBalance: currentBalance.toString(),
      requiredAmount,
      isFromMaterializedView: currentPoint != null,
    });

    if (currentBalance < BigInt(requiredAmount)) {
      throw new ValidationError(
        `Insufficient balance: ${currentBalance} < ${requiredAmount}`,
        ["communityWallet", communityId]
      );
    }
  }
}
