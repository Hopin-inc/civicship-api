import {
  GqlQueryWalletsArgs,
  GqlQueryWalletArgs,
  GqlWallet,
  GqlWalletsConnection,
  GqlCommunity,
  GqlCommunityWalletsArgs,
  GqlUser,
  GqlUserWalletsArgs,
} from "@/types/graphql";
import WalletService from "@/application/membership/wallet/service";
import WalletPresenter from "@/application/membership/wallet/presenter";
import { IContext } from "@/types/server";
import WalletUtils from "@/application/membership/wallet/utils";

export default class WalletUseCase {
  static async userBrowseWallets(
    { filter, sort, cursor, first }: GqlQueryWalletsArgs,
    ctx: IContext,
  ): Promise<GqlWalletsConnection> {
    return WalletUtils.fetchWalletsCommon(ctx, {
      cursor,
      filter,
      sort,
      first,
    });
  }

  static async visitorBrowseWalletsByCommunity(
    { id }: GqlCommunity,
    { first, cursor }: GqlCommunityWalletsArgs,
    ctx: IContext,
  ): Promise<GqlWalletsConnection> {
    return WalletUtils.fetchWalletsCommon(ctx, {
      cursor,
      filter: { communityId: id },
      first,
    });
  }

  static async visitorBrowseWalletsByUser(
    { id }: GqlUser,
    { first, cursor }: GqlUserWalletsArgs,
    ctx: IContext,
  ) {
    return WalletUtils.fetchWalletsCommon(ctx, {
      cursor,
      filter: { userId: id },
      first,
    });
  }

  static async userViewWallet(
    { id }: GqlQueryWalletArgs,
    ctx: IContext,
  ): Promise<GqlWallet | null> {
    const wallet = await WalletService.findWallet(ctx, id);
    return wallet ? WalletPresenter.get(wallet) : null;
  }
}
