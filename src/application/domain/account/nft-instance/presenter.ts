import {
  GqlNftInstancesConnection,
} from "@/types/graphql";
import { NftInstanceWithRelations } from "@/application/domain/account/nft-instance/data/type";
import NftTokenPresenter from "@/application/domain/account/nft-token/presenter";

export default class NftInstancePresenter {
  static get(nftInstance: NftInstanceWithRelations): any {
    const { nftWallet, nftToken, ...nftInstanceProps } = nftInstance;

    return {
      __typename: "NftInstance",
      ...nftInstanceProps,
      nftToken: NftTokenPresenter.get(nftToken),
      nftWallet: {
        __typename: "NftWallet",
        ...nftWallet,
      },
    };
  }

  static query(
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
