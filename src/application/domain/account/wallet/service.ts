import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { GqlQueryWalletsArgs } from "@/types/graphql";
import { InsufficientBalanceError, NotFoundError, ValidationError } from "@/errors/graphql";
import WalletConverter from "@/application/domain/account/wallet/data/converter";
import { IWalletRepository } from "@/application/domain/account/wallet/data/interface";
import { inject, injectable } from "tsyringe";
import { PrismaWallet } from "@/application/domain/account/wallet/data/type";
import TransactionService from "@/application/domain/transaction/service";
import logger from "@/infrastructure/logging";

@injectable()
export default class WalletService {
  constructor(
    @inject("WalletRepository") private readonly repository: IWalletRepository,
    @inject("WalletConverter") private readonly converter: WalletConverter,
    @inject("TransactionService") private readonly transactionService: TransactionService,
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
        return this.transactionService.refreshCurrentPoint(ctx, tx);
      });
      return true;
    } else return false;
  }

  /**
   * Check community wallet balance inside transaction (TOCTOU-safe).
   * Throws InsufficientBalanceError if insufficient balance.
   * Throws NotFoundError if community wallet doesn't exist.
   *
   * IMPORTANT: This method calculates balance in real-time from the Transaction table,
   * NOT from the materialized view. This ensures we get the latest balance even if
   * other transactions have modified it.
   *
   * @param ctx - Context
   * @param communityId - Community ID
   * @param requiredAmount - Required amount (must be a safe integer)
   * @param tx - Transaction client (required)
   * @throws InsufficientBalanceError if insufficient balance
   * @throws NotFoundError if community wallet not found
   */
  async checkCommunityWalletBalanceInTransaction(
    ctx: IContext,
    communityId: string,
    requiredAmount: number,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    // Validate requiredAmount is a safe integer for BigInt conversion
    if (!Number.isSafeInteger(requiredAmount)) {
      throw new ValidationError(
        "requiredAmount must be a safe integer for BigInt conversion",
        [String(requiredAmount)],
      );
    }

    if (requiredAmount < 0) {
      throw new ValidationError("requiredAmount must be non-negative", [String(requiredAmount)]);
    }

    const communityWallet = await this.repository.findCommunityWallet(ctx, communityId, tx);

    if (!communityWallet?.id) {
      throw new NotFoundError("Community wallet", { communityId });
    }

    // Calculate real-time balance from Transaction table (NOT materialized view)
    const currentBalance = await this.repository.calculateCurrentBalance(communityWallet.id, tx);

    logger.debug("Checking community wallet balance in transaction", {
      communityId,
      walletId: communityWallet.id,
      currentBalance: currentBalance.toString(),
      requiredAmount,
      source: "real-time aggregate",
    });

    const requiredAmountBigInt = BigInt(requiredAmount);
    if (currentBalance < requiredAmountBigInt) {
      throw new InsufficientBalanceError(currentBalance.toString(), requiredAmount);
    }
  }
}
