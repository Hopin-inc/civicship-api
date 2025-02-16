import {
  GqlQueryWalletsArgs,
  GqlQueryWalletArgs,
  GqlWallet,
  GqlTransactionsConnection,
  GqlWalletTransactionsArgs,
} from "@/types/graphql";
import WalletReadUseCase from "@/application/membership/wallet/usecase/read";
import { IContext } from "@/types/server";
import TransactionReadUseCase from "@/application/transaction/usecase/read";

const walletResolver = {
  Query: {
    wallets: async (_: unknown, args: GqlQueryWalletsArgs, ctx: IContext) =>
      WalletReadUseCase.userBrowseWallets(args, ctx),
    wallet: async (_: unknown, args: GqlQueryWalletArgs, ctx: IContext) => {
      if (!ctx.loaders?.wallet) {
        return WalletReadUseCase.userViewWallet(args, ctx);
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
      return TransactionReadUseCase.visitorBrowseTransactionsByWallet(parent, args, ctx);
    },
  },
};

export default walletResolver;
