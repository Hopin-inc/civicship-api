import { GqlNftInstance, GqlNftInstancesConnection } from "@/types/graphql";
import { PrismaNftInstance } from "@/application/domain/account/nft-instance/data/type";
import NftTokenPresenter from "@/application/domain/account/nft-token/presenter";

export default class NftInstancePresenter {
  static get(nftInstance: PrismaNftInstance): GqlNftInstance {
    const { nftWallet, nftToken, ...nftInstanceProps } = nftInstance;

    // The `user` field on `nftWallet` is filled in by the GraphQL field resolver,
    // so the literal here doesn't satisfy `GqlNftWallet` structurally.
    return {
      __typename: "NftInstance",
      ...nftInstanceProps,
      nftToken: NftTokenPresenter.get(nftToken),
      nftWallet: nftWallet ? {
        __typename: "NftWallet",
        ...nftWallet,
      } : null,
    } as unknown as GqlNftInstance;
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
