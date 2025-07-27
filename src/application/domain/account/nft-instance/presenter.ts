import {
  GqlNftInstance,
  GqlNftInstancesConnection,
  GqlNftToken,
} from "@/types/graphql";

type NftInstanceWithRelations = {
  id: string;
  instanceId: string;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  json: any;
  createdAt: Date;
  updatedAt: Date | null;
  nftToken?: {
    id: string;
    address: string;
    name: string | null;
    symbol: string | null;
    type: string;
    json: any;
    createdAt: Date;
    updatedAt: Date | null;
  } | null;
  nftWallet: {
    id: string;
    walletAddress: string;
    createdAt: Date;
    updatedAt: Date | null;
  };
};

export default class NftInstancePresenter {
  static toGraphQL(nftInstance: NftInstanceWithRelations): GqlNftInstance {
    return {
      __typename: "NftInstance",
      id: nftInstance.id,
      instanceId: nftInstance.instanceId,
      name: nftInstance.name,
      description: nftInstance.description,
      imageUrl: nftInstance.imageUrl,
      json: nftInstance.json,
      nftToken: nftInstance.nftToken ? this.nftTokenToGraphQLSafe(nftInstance.nftToken) : null,
      nftWallet: {
        __typename: "NftWallet",
        id: nftInstance.nftWallet.id,
        walletAddress: nftInstance.nftWallet.walletAddress,
        createdAt: nftInstance.nftWallet.createdAt,
        updatedAt: nftInstance.nftWallet.updatedAt,
      },
      createdAt: nftInstance.createdAt,
      updatedAt: nftInstance.updatedAt,
    };
  }

  static nftTokenToGraphQL(nftToken: NftInstanceWithRelations['nftToken']): GqlNftToken {
    if (!nftToken) throw new Error("nftToken is null");
    
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
    nftInstances: GqlNftInstance[],
    hasNextPage: boolean,
    cursor?: string
  ): GqlNftInstancesConnection {
    return {
      __typename: "NftInstancesConnection",
      totalCount: nftInstances.length,
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
