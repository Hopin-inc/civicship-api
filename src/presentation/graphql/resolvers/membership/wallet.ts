import {
  GqlQueryWalletsArgs,
  GqlQueryWalletArgs,
  GqlWallet,
  GqlTransactionsConnection,
  GqlWalletTransactionsArgs,
  GqlUtilityHistoriesConnection,
  GqlWalletUtilityHistoriesArgs,
} from "@/types/graphql";
import WalletUseCase from "@/application/membership/wallet/usecase";
import { IContext } from "@/types/server";
import TransactionUseCase from "@/application/transaction/usecase";
import UtilityHistoryUseCase from "@/application/utility/history/usecase";

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

    utilityHistories: async (
      parent: GqlWallet,
      args: GqlWalletUtilityHistoriesArgs,
      ctx: IContext,
    ): Promise<GqlUtilityHistoriesConnection> => {
      return UtilityHistoryUseCase.visitorBrowseUtilityHistoriesByWallet(parent, args, ctx);
    },
  },
};

export default walletResolver;
