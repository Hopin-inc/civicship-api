import { GqlWallet, GqlWalletsConnection } from "@/types/graphql";
import { PrismaWalletDetail } from "@/application/domain/account/wallet/data/type";

export default class WalletPresenter {
  static query(r: GqlWallet[], hasNextPage: boolean, cursor?: string): GqlWalletsConnection {
    return {
      __typename: "WalletsConnection",
      totalCount: r.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        startCursor: r.length > 0 ? r[0].id : null,
        endCursor: r.length > 0 ? r[r.length - 1].id : null,
      },
      edges: r.map((wallet) => ({
        cursor: wallet.id,
        node: wallet,
      })),
    };
  }

  static get(r: PrismaWalletDetail): GqlWallet {
    return {
      __typename: "Wallet",
      ...r,
    };
  }
}
