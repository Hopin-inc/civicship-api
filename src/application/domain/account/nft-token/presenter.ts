import { GqlNftToken } from "@/types/graphql";
import { NftInstanceWithRelations } from "@/application/domain/account/nft-instance/data/type";

export default class NftTokenPresenter {
  static get(nftToken: NftInstanceWithRelations['nftToken']): GqlNftToken | null {
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
}
