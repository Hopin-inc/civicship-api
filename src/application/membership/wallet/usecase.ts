import {
  GqlQueryWalletsArgs,
  GqlQueryWalletArgs,
  GqlWallet,
  GqlWalletsConnection,
} from "@/types/graphql";
import WalletService from "@/application/membership/wallet/service";
import WalletPresenter from "@/application/membership/wallet/presenter";
import { IContext } from "@/types/server";
import { clampFirst } from "@/application/utils";

export default class WalletUseCase {
  static async visitorBrowseWallets(
    { filter, sort, cursor, first }: GqlQueryWalletsArgs,
    ctx: IContext,
  ): Promise<GqlWalletsConnection> {
    const take = clampFirst(first);

    const records = await WalletService.fetchWallets(
      ctx,
      {
        cursor,
        filter,
        sort,
      },
      take,
    );

    const hasNextPage = records.length > take;
    const data = records.slice(0, take).map((record) => {
      return WalletPresenter.get(record);
    });
    return WalletPresenter.query(data, hasNextPage);
  }

  static async userViewWallet(
    { id }: GqlQueryWalletArgs,
    ctx: IContext,
  ): Promise<GqlWallet | null> {
    const wallet = await WalletService.findWallet(ctx, id);
    return wallet ? WalletPresenter.get(wallet) : null;
  }
}
