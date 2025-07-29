import {
  GqlNftInstancesConnection,
  GqlNftToken,
} from "@/types/graphql";
import { NftInstanceWithRelations } from "@/application/domain/account/nft-instance/data/type";

export default class NftInstancePresenter {
  static get(nftInstance: NftInstanceWithRelations): any {
    const { nftWallet, nftToken, ...nftInstanceProps } = nftInstance;
    
    return {
      __typename: "NftInstance",
      ...nftInstanceProps,
      nftToken: nftToken ? this.nftTokenToGraphQLSafe(nftToken) : null,
      nftWallet: {
        __typename: "NftWallet",
        id: nftWallet.id,
        walletAddress: nftWallet.walletAddress,
        createdAt: nftWallet.createdAt,
        updatedAt: nftWallet.updatedAt,
      },
    };
  }

  static nftTokenToGraphQLSafe(nftToken: NftInstanceWithRelations['nftToken']): GqlNftToken | null {
    if (!nftToken) return null;
    
    return {
      __typename: "NftToken",
      id: nftToken.id,
      address: nftToken.address,
      name: nftToken.name,
      symbol: nftToken.symbol,
      type: nftToken.type,
      json: nftToken.json,
      createdAt: nftToken.createdAt,
      updatedAt: nftToken.updatedAt,
    };
  }

  static nftInstancesQuery(
    nftInstances: any[],
    hasNextPage: boolean,
    totalCount: number,
    cursor?: string
  ): GqlNftInstancesConnection {
    return {
      __typename: "NftInstancesConnection",
      totalCount,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        startCursor: nftInstances[0]?.id,
        endCursor: nftInstances.length ? nftInstances[nftInstances.length - 1].id : undefined,
      },
      edges: nftInstances.map((nftInstance) => ({
        cursor: nftInstance.id,
        node: nftInstance,
      })),
    };
  }
}
