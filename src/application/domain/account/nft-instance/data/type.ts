import { NftInstance, NftToken, NftWallet } from "@prisma/client";

export type NftInstanceWithRelations = NftInstance & {
  nftToken?: NftToken | null;
  nftWallet: NftWallet;
};
