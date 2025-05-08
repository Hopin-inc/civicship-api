import {
  GqlQueryWalletsArgs,
  GqlQueryWalletArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";

import WalletUseCase from "@/application/domain/account/wallet/usecase";
import { PrismaWalletDetail } from "@/application/domain/account/wallet/data/type";

@injectable()
export default class WalletResolver {
  constructor(
    @inject("WalletUseCase") private readonly walletUseCase: WalletUseCase,
  ) { }

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
      return ctx.loaders.ticket.loadMany(parent.tickets.map(t => t.id));
    },

    // TODO: これで問題ないかをチェックする
    transactions: async (parent: PrismaWalletDetail, _: unknown, ctx: IContext,) => {
      const from = ctx.loaders.transaction.loadMany(parent.fromTransactions.map(t => t.id));
      const to = ctx.loaders.transaction.loadMany(parent.toTransactions.map(t => t.id));
      return [...(await from), ...(await to)];
    },
  };
}
