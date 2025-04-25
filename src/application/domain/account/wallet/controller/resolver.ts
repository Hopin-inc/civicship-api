import {
  GqlQueryWalletsArgs,
  GqlQueryWalletArgs,
  GqlWallet,
  GqlTransactionsConnection,
  GqlWalletTransactionsArgs,
} from "@/types/graphql";
import WalletUseCase from "@/application/domain/account/wallet/usecase";
import { IContext } from "@/types/server";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import TicketUseCase from "@/application/domain/reward/ticket/usecase";

const walletResolver = {
  Query: {
    wallets: async (_: unknown, args: GqlQueryWalletsArgs, ctx: IContext) =>
      WalletUseCase.visitorBrowseWallets(args, ctx),
    wallet: async (_: unknown, args: GqlQueryWalletArgs, ctx: IContext) => {
      if (!ctx.loaders?.wallet) {
        return WalletUseCase.userViewWallet(args, ctx);
      }
      return await ctx.loaders.wallet.load(args.id);
    },
  },

  Wallet: {
    tickets: async (parent: GqlWallet, args: GqlQueryWalletArgs, ctx: IContext) => {
      return TicketUseCase.visitorBrowseTickets(ctx, {
        filter: { walletId: parent.id },
        ...args,
      });
    },
    transactions: async (
      parent: GqlWallet,
      args: GqlWalletTransactionsArgs,
      ctx: IContext,
    ): Promise<GqlTransactionsConnection> => {
      return TransactionUseCase.visitorBrowseTransactions(
        {
          filter: { fromWalletId: parent.id, toWalletId: parent.id, ...args },
        },
        ctx,
      );
    },
  },
};

export default walletResolver;
