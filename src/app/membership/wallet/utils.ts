import { IContext } from "@/types/server";
import {
  GqlWalletsConnection,
  GqlWalletFilterInput,
  GqlWalletSortInput,
  GqlWallet,
} from "@/types/graphql";

import { clampFirst } from "@/utils";
import WalletService from "@/app/membership/wallet/service";
import WalletOutputFormat from "@/presen/graphql/dto/membership/wallet/output";

export default class WalletUtils {
  static async fetchWalletsCommon(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlWalletFilterInput;
      sort?: GqlWalletSortInput;
      first?: number;
    },
  ): Promise<GqlWalletsConnection> {
    const take = clampFirst(first);

    const res = await WalletService.fetchWallets(ctx, { cursor, filter, sort }, take);
    const hasNextPage = res.length > take;

    const data = res.slice(0, take).map((record) => {
      return WalletOutputFormat.get(record);
    });

    return WalletOutputFormat.query(data, hasNextPage);
  }

  static async validateTransfer(
    requiredPoints: number,
    fromWallet: GqlWallet | null,
    toWallet: GqlWallet | null,
  ) {
    if (!fromWallet || !toWallet) {
      throw new Error("Wallet information is missing for points transfer");
    }
    const { currentPoint } = fromWallet.currentPointView || {};

    if (!currentPoint || currentPoint < requiredPoints) {
      throw new Error(
        `Insufficient points in community wallet. Required: ${requiredPoints}, Available: ${currentPoint || 0}`,
      );
    }
  }
}
