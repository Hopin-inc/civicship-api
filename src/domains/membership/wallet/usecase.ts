import {
  GqlQueryWalletsArgs,
  GqlQueryWalletArgs,
  GqlWallet,
  GqlWalletsConnection,
  GqlCommunity,
  GqlCommunityWalletsArgs,
} from "@/types/graphql";
import WalletService from "@/domains/membership/wallet/service";
import WalletOutputFormat from "@/domains/membership/wallet/presenter/output";
import { IContext } from "@/types/server";
import { WalletUtils } from "@/domains/membership/wallet/utils";

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
  static async userViewWallet(
    { id }: GqlQueryWalletArgs,
    ctx: IContext,
  ): Promise<GqlWallet | null> {
    const wallet = await WalletService.findWallet(ctx, id);
    return wallet ? WalletOutputFormat.get(wallet) : null;
  }
}
