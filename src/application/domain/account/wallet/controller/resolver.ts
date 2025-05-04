import {
  GqlQueryWalletsArgs,
  GqlQueryWalletArgs,
  GqlQueryTransactionsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";

import WalletUseCase from "@/application/domain/account/wallet/usecase";
import { PrismaWalletDetail } from "@/application/domain/account/wallet/data/type";

@injectable()
export default class WalletResolver {
  constructor(
    @inject("WalletUseCase") private readonly walletUseCase: WalletUseCase,
  ) {}

  Query = {
    wallets: (_: unknown, args: GqlQueryWalletsArgs, ctx: IContext) => {
      return this.walletUseCase.visitorBrowseWallets(args, ctx);
    },
    wallet: (_: unknown, args: GqlQueryWalletArgs, ctx: IContext) => {
      return ctx.loaders.wallet.load(args.id);
    },
  };

  Wallet = {
    community: (parent: PrismaWalletDetail, _: unknown, ctx: IContext) => {
      return parent.communityId ? ctx.loaders.community.load(parent.communityId) : null;
    },
    
    user: (parent: PrismaWalletDetail, _: unknown, ctx: IContext) => {
      return parent.userId ? ctx.loaders.user.load(parent.userId) : null;
    },
    
    tickets: (parent: PrismaWalletDetail, _: unknown, ctx: IContext) => {
      return ctx.issuer.internal(async (tx) => {
        const tickets = await tx.ticket.findMany({
          where: { walletId: parent.id },
          select: { id: true },
        });
        return ctx.loaders.ticket.loadMany(tickets.map(t => t.id));
      });
    },
    
    transactions: (
      parent: PrismaWalletDetail,
      args: GqlQueryTransactionsArgs,
      ctx: IContext,
    ) => {
      return ctx.issuer.internal(async (tx) => {
        const transactions = await tx.transaction.findMany({
          where: { 
            OR: [
              { fromWallet: { id: parent.id } },
              { toWallet: { id: parent.id } }
            ]
          },
          select: { id: true },
        });
        return ctx.loaders.transaction.loadMany(transactions.map(t => t.id));
      });
    },
  };
}
