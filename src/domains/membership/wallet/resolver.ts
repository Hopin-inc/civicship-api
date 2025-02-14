import {
  GqlQueryWalletsArgs,
  GqlQueryWalletArgs,
  GqlWallet,
  GqlTransactionsConnection,
  GqlWalletTransactionsArgs,
} from "@/types/graphql";
import WalletUseCase from "@/domains/membership/wallet/usecase";
import { IContext } from "@/types/server";
import TransactionUseCase from "@/domains/transaction/usecase";

const walletResolver = {
  Query: {
    wallets: async (_: unknown, args: GqlQueryWalletsArgs, ctx: IContext) =>
      WalletUseCase.userBrowseWallets(args, ctx),
    wallet: async (_: unknown, args: GqlQueryWalletArgs, ctx: IContext) => {
      if (!ctx.loaders?.wallet) {
        return WalletUseCase.userViewWallet(args, ctx);
      }
      return await ctx.loaders.wallet.load(args.id);
    },
  },

  Wallet: {
    transactions: async (
      parent: GqlWallet,
      args: GqlWalletTransactionsArgs,
      ctx: IContext,
    ): Promise<GqlTransactionsConnection> => {
      return TransactionUseCase.visitorBrowseTransactionsByWallet(parent, args, ctx);
    },
  },
};

export default walletResolver;
