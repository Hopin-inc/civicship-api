import { GqlNftToken, GqlNftTokensConnection } from "@/types/graphql";
import { NftToken } from "@prisma/client";
import { PrismaNftToken } from "@/application/domain/account/nft-token/data/type";

export default class NftTokenPresenter {
  static get(nftToken?: NftToken | PrismaNftToken | null): GqlNftToken | null {
    if (!nftToken) return null;

    return {
      __typename: "NftToken",
      ...nftToken,
      // community は field resolver で解決される。communityId はスプレッドに含まれる。
      community: null,
    };
  }

  static query(
    nftTokens: PrismaNftToken[],
    hasNextPage: boolean,
    totalCount: number,
    cursor?: string,
  ): GqlNftTokensConnection {
    return {
      __typename: "NftTokensConnection",
      totalCount,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        startCursor: nftTokens[0]?.id,
        endCursor: nftTokens.length ? nftTokens[nftTokens.length - 1].id : undefined,
      },
      edges: nftTokens.map((nftToken) => ({
        __typename: "NftTokenEdge",
        cursor: nftToken.id,
        node: NftTokenPresenter.get(nftToken)!,
      })),
    };
  }
}
