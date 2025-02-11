import { IContext } from "@/types/server";
import { GqlWalletsConnection, GqlWalletFilterInput, GqlWalletSortInput } from "@/types/graphql";

import { clampFirst } from "@/graphql/pagination";
import WalletService from "@/domains/membership/wallet/service";
import WalletOutputFormat from "@/domains/membership/wallet/presenter/output";

export const WalletUtils = {
  async fetchWalletsCommon(
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
  },
};
