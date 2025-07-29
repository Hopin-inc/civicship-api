import { GqlNftToken } from "@/types/graphql";
import { NftInstanceWithRelations } from "@/application/domain/account/nft-instance/data/type";

export default class NftTokenPresenter {
  static get(nftToken: NftInstanceWithRelations['nftToken']): GqlNftToken | null {
    if (!nftToken) return null;

    return {
      __typename: "NftToken",
      ...nftToken,
    };
  }
}
