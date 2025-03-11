import { GqlWallet, GqlWalletsConnection } from "@/types/graphql";
import { WalletPayloadWithArgs } from "@/application/wallet/infrastructure/type";

export default class WalletOutputFormat {
  static query(r: GqlWallet[], hasNextPage: boolean): GqlWalletsConnection {
    return {
      totalCount: r.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: false,
        startCursor: r.length > 0 ? r[0].id : null,
        endCursor: r.length > 0 ? r[r.length - 1].id : null,
      },
      edges: r.map((wallet) => ({
        cursor: wallet.id,
        node: wallet,
      })),
    };
  }

  static get(r: WalletPayloadWithArgs): GqlWallet {
    const { community, user, currentPointView, ...prop } = r;

    return {
      ...prop,
      community,
      user,
      currentPointView,
    };
  }
}
