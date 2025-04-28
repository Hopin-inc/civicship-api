import {
  GqlQueryWalletsArgs,
  GqlQueryWalletArgs,
  GqlWallet,
  GqlWalletsConnection,
} from "@/types/graphql";
import WalletService from "@/application/domain/account/wallet/service";
import WalletPresenter from "@/application/domain/account/wallet/presenter";
import { IContext } from "@/types/server";
import { clampFirst } from "@/application/domain/utils";

export default class WalletUseCase {
  constructor(private readonly walletService: WalletService) {}

  async visitorBrowseWallets(
    { filter, sort, cursor, first }: GqlQueryWalletsArgs,
    ctx: IContext,
  ): Promise<GqlWalletsConnection> {
    const take = clampFirst(first);

    const records = await this.walletService.fetchWallets(ctx, { cursor, filter, sort }, take);

    const hasNextPage = records.length > take;
    const data = records.slice(0, take).map((record) => {
      return WalletPresenter.get(record);
    });

    return WalletPresenter.query(data, hasNextPage);
  }

  async userViewWallet({ id }: GqlQueryWalletArgs, ctx: IContext): Promise<GqlWallet | null> {
    const wallet = await this.walletService.findWallet(ctx, id);
    return wallet ? WalletPresenter.get(wallet) : null;
  }
}
