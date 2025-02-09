import {
  GqlQueryWalletsArgs,
  GqlQueryWalletArgs,
  GqlWallet,
  GqlWalletsConnection,
} from "@/types/graphql";
import WalletService from "@/domains/membership/wallet/service";
import WalletOutputFormat from "@/domains/membership/wallet/presenter/output";
import { IContext } from "@/types/server";

export default class WalletUseCase {
  static async userBrowseWallets(
    { filter, sort, cursor, first }: GqlQueryWalletsArgs,
    ctx: IContext,
  ): Promise<GqlWalletsConnection> {
    const take = first ?? 10;
    const wallets = await WalletService.fetchWallets(ctx, { filter, sort, cursor }, take);
    const hasNextPage = wallets.length > take;

    const data: GqlWallet[] = wallets
      .slice(0, take)
      .map((wallet) => WalletOutputFormat.get(wallet));

    return WalletOutputFormat.query(data, hasNextPage);
  }

  static async userViewWallet(
    { id }: GqlQueryWalletArgs,
    ctx: IContext,
  ): Promise<GqlWallet | null> {
    const wallet = await WalletService.findWallet(ctx, id);
    return wallet ? WalletOutputFormat.get(wallet) : null;
  }
}
