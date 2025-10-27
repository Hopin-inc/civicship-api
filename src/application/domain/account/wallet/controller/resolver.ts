import { GqlQueryWalletsArgs, GqlQueryWalletArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";

import WalletUseCase from "@/application/domain/account/wallet/usecase";
import { PrismaWalletDetail } from "@/application/domain/account/wallet/data/type";

@injectable()
export default class WalletResolver {
  constructor(@inject("WalletUseCase") private readonly walletUseCase: WalletUseCase) {}

  Query = {
    wallets: (_: unknown, args: GqlQueryWalletsArgs, ctx: IContext) => {
      return this.walletUseCase.visitorBrowseWallets(args, ctx);
    },
    wallet: (_: unknown, args: GqlQueryWalletArgs, ctx: IContext) => {
      return this.walletUseCase.userViewWallet(args, ctx);
    },
    myWallet: (_: unknown, args: GqlQueryWalletArgs, ctx: IContext) => {
      return this.walletUseCase.userViewMyWallet(args, ctx);
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
      return ctx.loaders.ticketsByWallet.load(parent.id);
    },

    transactions: async (parent: PrismaWalletDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.transactionsByWallet.load(parent.id);
    },
  };
}
