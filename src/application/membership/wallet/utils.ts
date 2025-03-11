import { IContext } from "@/types/server";
import {
  GqlWalletsConnection,
  GqlWalletFilterInput,
  GqlWalletSortInput,
  GqlWallet,
} from "@/types/graphql";

import { clampFirst } from "@/utils";
import WalletService from "@/application/membership/wallet/service";
import WalletOutputFormat from "@/presentation/graphql/dto/membership/wallet/output";
import { InsufficientBalanceError, ValidationError } from "@/errors/graphql";

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
      const invalidArgs = [
        ...(!fromWallet ? ["fromWallet"] : []),
        ...(!toWallet ? ["toWallet"] : []),
      ];
      throw new ValidationError("Wallet information is missing for points transfer", invalidArgs);
    }
    const { currentPoint } = fromWallet.currentPointView || {};

    if (!currentPoint || currentPoint < requiredPoints) {
      throw new InsufficientBalanceError(currentPoint ?? 0, requiredPoints);
    }
  }
}
