import { GqlNftToken } from "@/types/graphql";
import { NftToken } from "@prisma/client";

export default class NftTokenPresenter {
  static get(nftToken?: NftToken | null): GqlNftToken | null {
    if (!nftToken) return null;

    return {
      __typename: "NftToken",
      ...nftToken,
    };
  }
}
