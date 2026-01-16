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
    // (fromPointChange is positive value, so we subtract it)
    return incomingSum - outgoingSum;
  }
}
