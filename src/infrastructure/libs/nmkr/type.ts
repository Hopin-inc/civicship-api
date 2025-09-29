export type CreateProjectRequest = {
  projectname: string;
  description: string;
  projecturl: string;
  tokennamePrefix: string;
  policyExpires: boolean;
  policyLocksDateTime: string; // ISO8601
  payoutWalletaddress: string;
  maxNftSupply: number;
  // metadataTemplate: string;
  addressExpiretime: number;
  pricelist: {
    countNft: number;
    price: number;
    currency: "ADA";
    isActive: boolean;
    validFrom: string; // ISO8601
    validTo: string; // ISO8601
  }[];
  enableCardano: boolean;
};

export type CreateProjectResponse = {
  projectId: number;
  metadata: string;
  policyId: string;
  policyScript: string;
  policyExpiration: string; // ISO8601
  uid: string;
  created: string; // ISO8601
};

export type UploadNftRequest = {
  tokenname: string;
  displayname: string;
  description: string;
  previewImageNft: {
    mimetype: string;
    fileFromBase64?: string;
    fileFromsUrl?: string;
    fileFromIPFS?: string;
  };
  subfiles?: Array<{
    subfile: {
      mimetype: string;
      fileFromBase64?: string;
      fileFromsUrl?: string;
      fileFromIPFS?: string;
    };
    description?: string;
    metadataPlaceholder?: Array<{ name: string; value: string }>;
  }>;
  metadataPlaceholder?: Array<{ name: string; value: string }>;
  metadataOverride?: string;
  metadataOverrideCip68?: string;
  priceInLovelace?: number;
  isBlocked?: boolean;
};

export type UploadNftResponse = {
  nftId: number;
  nftUid: string;
  ipfsHashMainnft: string;
  ipfsHashSubfiles: string[];
  metadata: string; // JSON文字列（721 metadata）
  assetId: string;
  metadataAptos?: string | null;
  metadataSolana?: string | null;
};

export type MintAndSendSpecificResponse = {
  mintAndSendId: number;
  sendedNft: Array<{
    id: number;
    uid: string;
    name: string;
    displayname: string;
    detaildata: string;
    ipfsLink: string;
    gatewayLink: string;
    state: string;
    minted: boolean;
    policyId: string;
    assetId: string;
    assetname: string;
    fingerprint: string;
    initialMintTxHash: string;
    series: string;
    tokenamount: number;
    price: number;
    selldate: string; // ISO 8601
    paymentGatewayLinkForSpecificSale: string;
    priceSolana: number;
    priceAptos: number;
  }>;
};

export type CreateWalletResponse = {
  address: string; // 作成されたウォレットアドレス
  adressType: string; // "enterprise" など (typo: addressType ではなく adressType で返ってくる)
  network: string; // "Preprod" / "Mainnet"
  walletName: string;
  seedPhrase: string; // 24 words
  pkh: string; // Public Key Hash
};

// export type CreatePaymentTransactionRequest = {
//   projectUid: string;
//   referer?: string;
//   customerIpAddress?: string;
//   customProperties?: Record<string, string>;
//   paymentTransactionNotifications?: Array<{
//     notificationType: "webhook";
//     notificationEndpoint: string;
//     hmacSecret: string;
//   }>;
//   paymentTransactionType: "nmkr_pay_specific";
//   paymentgatewayParameters: {
//     mintNfts: {
//       countNfts: number;
//       reserveNfts?: Array<{
//         lovelace: number;
//         nftUid: string;
//         tokencount: number;
//       }>;
//     };
//     optionalRecevierAddress?: string;
//   };
// };
//
// export type CreatePaymentTransactionResponse = {
//   paymentTransactionUid: string;
//   projectUid: string;
//   customProperties?: Record<string, string>;
//   state: string; // e.g. "active"
//   paymentTransactionCreated: string; // ISO date
//   customeripaddress?: string;
//   referer?: string;
//   txHash?: string;
//   expires: string; // ISO date
//   nmkrPayUrl: string;
//   paymentTransactionType: string; // e.g. "paymentgateway_nft_specific"
//
//   transactionParameters?: Array<{
//     tokencount: number;
//     policyId: string;
//     tokenname: string;
//     tokennameHex: string;
//   }>;
//
//   paymentgatewayResults?: {
//     priceInLovelace: number;
//     fee: number;
//     discount: number;
//     tokenRewards: number;
//     stakeRewards: number;
//     minUtxo: number;
//     mintNfts?: {
//       countNfts: number;
//       reserveNfts?: Array<{
//         nftUid: string;
//         tokencount: number;
//         tokennameHex: string;
//         policyId: string;
//         nftId: number;
//         lovelace: number;
//       }>;
//     };
//     additionalPriceInTokens?: Array<{
//       countToken: number;
//       policyId: string;
//       assetNameInHex: string;
//       multiplier: number;
//       totalCount: number;
//       assetName: string;
//       decimals: number;
//     }>;
//     optionalReceiverAddress?: string;
//     receiverAddress?: string;
//     txHash?: string;
//     receiverStakeAddress?: string;
//     senderAddress?: string;
//   };
//
//   auctionResults?: {
//     jsonHash: string;
//     minBet: number;
//     runsUntil: string; // ISO date
//     actualBid: number;
//     history: Array<{
//       txHash: string;
//       bidAmount: number;
//       created: string; // ISO date
//       state: string;
//       address: string;
//       returnTxHash: string;
//       signedAndSubmitted: boolean;
//     }>;
//     marketplaceFeePercent: number;
//     royaltyFeePercent: number;
//   };
//
//   directSaleResults?: {
//     sellingPrice: number;
//     lockedInAmount: number;
//     sellerAddress: string;
//     buyerAddress: string;
//     sellerTxDatumHash: string;
//     sellerTxHash: string;
//     sellerTxCreate: string; // ISO date
//     receivers: Array<{
//       pkh: string;
//       address: string;
//       amountInLovelace: number;
//       tokens: Array<{
//         countToken: number;
//         policyId: string;
//         assetNameInHex: string;
//         multiplier: number;
//         totalCount: number;
//         assetName: string;
//         decimals: number;
//       }>;
//       recevierType: string;
//     }>;
//     buyoutSmartcontractAddress: {
//       paymentAddress: string;
//       paymentAddressId: number;
//       expires: string;
//       adaToSend: string;
//       solToSend: string;
//       aptToSend: string;
//       debug: string;
//       priceInEur: number;
//       priceInUsd: number;
//       priceInJpy: number;
//       effectivedate: string;
//       priceInLovelace: number;
//       additionalPriceInTokens: Array<{
//         countToken: number;
//         policyId: string;
//         assetNameInHex: string;
//         multiplier: number;
//         totalCount: number;
//         assetName: string;
//         decimals: number;
//       }>;
//       sendbackToUser: number;
//       revervationtype: string;
//       currency: string;
//       priceInLamport: number;
//       priceInOcta: number;
//       priceInSatoshi: number;
//     };
//   };
//
//   directSaleOfferResults?: {
//     offerPrice: number;
//     lockedInAmount: number;
//     buyerAddress: string;
//     buyerTxDatumHash: string;
//     buyerTxHash: string;
//     buyerTxCreate: string; // ISO date
//     sellerAddress: string;
//     receivers: Array<{
//       pkh: string;
//       address: string;
//       amountInLovelace: number;
//       tokens: Array<{
//         countToken: number;
//         policyId: string;
//         assetNameInHex: string;
//         multiplier: number;
//         totalCount: number;
//         assetName: string;
//         decimals: number;
//       }>;
//       recevierType: string;
//     }>;
//   };
//
//   decentralParameters?: {
//     mintNfts: {
//       countNfts: number;
//       reserveNfts: Array<{
//         nftUid: string;
//         tokencount: number;
//         tokennameHex: string;
//         policyId: string;
//         nftId: number;
//         lovelace: number;
//       }>;
//     };
//     priceInLovelace: number;
//     additionalPriceInTokens: Array<{
//       countToken: number;
//       policyId: string;
//       assetNameInHex: string;
//       multiplier: number;
//       totalCount: number;
//       assetName: string;
//       decimals: number;
//     }>;
//     stakeRewards: number;
//     discount: number;
//     rejectParameter: string;
//     rejectReason: string;
//     tokenRewards: number;
//     fees: number;
//     optionalReceiverAddress: string;
//   };
//
//   mintAndSendResults?: {
//     state: string; // e.g. "execute"
//     transactionId: string;
//     executed: string; // ISO date
//     receiverAddress: string;
//   };
//
//   smartContractInformation?: {
//     smartcontractName: string;
//     smartcontractType: string;
//     smartcontractAddress: string;
//   };
//
//   paymentTransactionSubStateResult?: {
//     paymentTransactionSubstate: string;
//     lastTxHash: string;
//   };
//
//   cbor?: string;
//   signedCbor?: string;
//   signGuid?: string;
//   fee: number;
//   referencedTransaction?: string;
//   paymentGatewayType: string; // e.g. "paymentgateway_nft_specific"
// };
