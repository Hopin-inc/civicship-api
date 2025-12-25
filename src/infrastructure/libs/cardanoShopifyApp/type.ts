export type GetAddressRequestDto = {
  token: string;
};

export type GetAddressResponseDto = {
  sub: string;
  iss: string;
  aud: string;
  address: string;
};

export type NftFileDto = {
  name: string;
  mediaType: string;
  src: string[];
};

export type NftMetadataDto = {
  name: string;
  image: string[];
  mediaType: string;
  description: string[];
  files: NftFileDto[];
};

export type NftItemDto = {
  policyId: string;
  assetName: string;
  assetNameHex: string;
  fingerprint: string;
  quantity: string;
  mintTxHash: string;
  metadata: NftMetadataDto;
};

export type GetNftsResponseDto = {
  address: string;
  count: number;
  nfts: NftItemDto[];
};
