import { GqlNftInstancesConnection } from "@/types/graphql";
import { PrismaNftInstance } from "@/application/domain/account/nft-instance/data/type";
import NftTokenPresenter from "@/application/domain/account/nft-token/presenter";

export default class NftInstancePresenter {
  static get(nftInstance: PrismaNftInstance): any {
    const { nftWallet, nftProduct, ...nftInstanceProps } = nftInstance;

    return {
      __typename: "NftInstance",
      ...nftInstanceProps,
      nftToken: NftTokenPresenter.get(nftProduct?.nftToken),
      nftWallet: {
        __typename: "NftWallet",
        ...nftWallet,
      },
    };
  }

  static query(
    nftInstances: PrismaNftInstance[],
    hasNextPage: boolean,
    totalCount: number,
    cursor?: string,
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
        __typename: "NftInstanceEdge",
        cursor: nftInstance.id,
        node: NftInstancePresenter.get(nftInstance),
      })),
    };
  }
}
