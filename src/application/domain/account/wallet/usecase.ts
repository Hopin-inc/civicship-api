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
import { inject, injectable } from "tsyringe";

@injectable()
export default class WalletUseCase {
  constructor(
    @inject("WalletService")
    private readonly service: WalletService,
  ) {}

  async visitorBrowseWallets(
    { filter, sort, cursor, first }: GqlQueryWalletsArgs,
    ctx: IContext,
  ): Promise<GqlWalletsConnection> {
    const take = clampFirst(first);

    const records = await this.service.fetchWallets(ctx, { cursor, filter, sort }, take);

    const hasNextPage = records.length > take;
    const data = records.slice(0, take).map((record) => {
      return WalletPresenter.get(record);
    });

    return WalletPresenter.query(data, hasNextPage, cursor);
  }

  async userViewWallet({ id }: GqlQueryWalletArgs, ctx: IContext): Promise<GqlWallet | null> {
    const wallet = await this.service.findWallet(ctx, id);
    return wallet ? WalletPresenter.get(wallet) : null;
  }

  async userViewMyWallet(_, ctx: IContext): Promise<GqlWallet | null> {
    if (!ctx.currentUser?.id) return null;
    const wallet = await this.service.findMemberWallet(ctx, ctx.currentUser?.id, ctx.communityId);
    return wallet ? WalletPresenter.get(wallet) : null;
  }
}
