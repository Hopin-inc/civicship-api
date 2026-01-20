import { IContext } from "@/types/server";
import { walletInclude, walletSelectDetail } from "@/application/domain/account/wallet/data/type";
import { IWalletRepository } from "@/application/domain/account/wallet/data/interface";
import { injectable } from "tsyringe";
import { Prisma, WalletType } from "@prisma/client";

@injectable()
export default class WalletRepository implements IWalletRepository {
  async query(
    ctx: IContext,
    where: Prisma.WalletWhereInput,
    orderBy: Prisma.WalletOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.wallet.findMany({
        where,
        orderBy,
        select: walletSelectDetail,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  async find(ctx: IContext, id: string) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.wallet.findUnique({
        where: { id },
        include: walletInclude,
      });
    });
  }

  async findCommunityWallet(ctx: IContext, communityId: string, tx?: Prisma.TransactionClient) {
    if (tx) {
      return tx.wallet.findFirst({
        where: { communityId, type: WalletType.COMMUNITY },
        select: walletSelectDetail,
      });
    }
    return ctx.issuer.public(ctx, (tx) => {
      return tx.wallet.findFirst({
        where: { communityId, type: WalletType.COMMUNITY },
        select: walletSelectDetail,
      });
    });
  }

  async findFirstExistingMemberWallet(ctx: IContext, communityId: string, userId: string, tx?: Prisma.TransactionClient) {
    if (tx) {
      return tx.wallet.findFirst({
        where: { communityId, userId, type: WalletType.MEMBER },
        include: walletInclude,
      });
    }
    return ctx.issuer.public(ctx, (tx) => {
      return tx.wallet.findFirst({
        where: { communityId, userId, type: WalletType.MEMBER },
        include: walletInclude,
      });
    });
  }

  async create(ctx: IContext, data: Prisma.WalletCreateInput, tx: Prisma.TransactionClient) {
    return tx.wallet.create({
      data,
      include: walletInclude,
    });
  }

  async delete(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    return tx.wallet.delete({
      where: { id },
      select: walletSelectDetail,
    });
  }

  /**
   * Calculate current balance in real-time by aggregating all transactions.
   *
   * IMPORTANT: This method assumes the following data model invariants:
   * - fromPointChange: Always stored as POSITIVE value (amount deducted from sender)
   * - toPointChange: Always stored as POSITIVE value (amount received by recipient)
   * - These values represent absolute amounts, not signed deltas
   *
   * Balance calculation:
   * - Outgoing: sum of fromPointChange where wallet is sender (deduction)
   * - Incoming: sum of toPointChange where wallet is recipient (addition)
   * - Current Balance = Incoming - Outgoing
   *
   * This invariant is enforced by:
   * - TransactionService.createTransaction() validation
   * - TransactionConverter.create() normalization
   * - Database schema constraints (non-negative values recommended)
   *
   * @param walletId - Wallet ID to calculate balance for
   * @param tx - Transaction client (required for TOCTOU-safe operations)
   * @returns Current balance as BigInt
   */
  async calculateCurrentBalance(walletId: string, tx: Prisma.TransactionClient): Promise<bigint> {
    // Aggregate in parallel for better performance
    const [outgoing, incoming] = await Promise.all([
      tx.transaction.aggregate({
        where: { from: walletId },
        _sum: { fromPointChange: true },
      }),
      tx.transaction.aggregate({
        where: { to: walletId },
        _sum: { toPointChange: true },
      }),
    ]);

    const outgoingSum = BigInt(outgoing._sum.fromPointChange ?? 0);
    const incomingSum = BigInt(incoming._sum.toPointChange ?? 0);

    // Balance = incoming - outgoing
    // Both values are positive, so we subtract outgoing from incoming
    return incomingSum - outgoingSum;
  }
}
