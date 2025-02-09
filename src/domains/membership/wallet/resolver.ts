import { GqlQueryWalletsArgs, GqlQueryWalletArgs } from "@/types/graphql";
import WalletUseCase from "@/domains/membership/wallet/usecase";
import { IContext } from "@/types/server";

const walletResolver = {
  Query: {
    wallets: async (_: unknown, args: GqlQueryWalletsArgs, ctx: IContext) =>
      WalletUseCase.userBrowseWallets(args, ctx),
    wallet: async (_: unknown, args: GqlQueryWalletArgs, ctx: IContext) =>
      WalletUseCase.userViewWallet(args, ctx),
  },
};

export default walletResolver;
