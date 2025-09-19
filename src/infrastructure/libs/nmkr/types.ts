export type NmkrBaseResponse = {
  result: "Ok" | "Error";
  errorMessage?: string;
};

export type NmkrApiError = NmkrBaseResponse & {
  result: "Error";
  errorMessage: string;
};

export type NmkrPaymentNotification = {
  notificationType: "webhook";
  notificationEndpoint: string;
  hmacSecret?: string;
};

export type NmkrReservedNft = {
  lovelace: number;
  nftUid: string;
  tokencount: number;
  tokennameHex?: string;
  policyId?: string;
  nftId?: number;
};

export type CreatePaymentTransactionSpecificReq = {
  projectUid: string;
  referer?: string;
  customerIpAddress?: string;
  customProperties?: Record<string, string>;
  paymentTransactionNotifications?: NmkrPaymentNotification[];
  paymentTransactionType: "nmkr_pay_specific";
  paymentgatewayParameters: {
    mintNfts: {
      reserveNfts: Array<{
        lovelace: number;
        nftUid: string;
        tokencount: number;
      }>;
      countNfts?: number;
    };
    optionalRecevierAddress?: string;
  };
};

export type CreatePaymentTransactionRandomReq = {
  projectUid: string;
  referer?: string;
  customerIpAddress?: string;
  customProperties?: Record<string, string>;
  paymentTransactionNotifications?: NmkrPaymentNotification[];
  paymentTransactionType: "nmkr_pay_random";
  paymentgatewayParameters: {
    mintNfts: {
      countNfts: number;
    };
    optionalRecevierAddress?: string;
  };
};

export type CreatePaymentTransactionRes = {
  paymentTransactionUid: string;
  projectUid: string;
  state: string;
  nmkrPayUrl?: string;
  expires?: string;
  transactionType?: string;
  paymentTransactionSubstate?: string;
  paymentGatewayType?: string;
  paymentgatewayResults?: {
    mintNfts?: {
      countNfts?: number;
      reserveNfts?: NmkrReservedNft[];
    };
    priceInLovelace?: number;
  };
};


export type PricelistResponse = NmkrBaseResponse & {
  pricelist: Array<{
    lovelace: number;
    countNfts: number;
    discount?: number;
  }>;
};

export type SaleConditionsResponse = NmkrBaseResponse & {
  saleConditions: {
    enableRandom: boolean;
    enableSpecific: boolean;
    maxNftsPerTransaction: number;
    minLovelacePerTransaction?: number;
    maxLovelacePerTransaction?: number;
    whitelistOnly?: boolean;
    saleStart?: string;
    saleEnd?: string;
  };
};

export type NftFileV2 = {
  mimetype?: string;
  fileFromBase64?: string;
  fileFromsUrl?: string;
  fileFromIPFS?: string;
};

export type UploadNftRequest = {
  tokenname?: string;
  displayname?: string;
  description?: string;
  previewImageNft?: NftFileV2;
  subfiles?: any[];
  metadataPlaceholder?: any[];
  metadataOverride?: string;
  metadataOverrideCip68?: string;
  priceInLovelace?: number;
  isBlocked?: boolean;
};

export type UploadNftResponse = {
  nftId: number;
  nftUid: string;
  ipfsHashMainnft?: string;
  ipfsHashSubfiles?: string[];
  metadata?: string;
  assetId?: string;
  metadataAptos?: string;
  metadataSolana?: string;
};

export type PaymentTransactionState = 
  | "active" 
  | "expired" 
  | "pending" 
  | "confirmed" 
  | "finished" 
  | "canceled";

export type PaymentTransactionSubstate = 
  | "waitingforlocknft"
  | "waitingforbid" 
  | "sold"
  | "canceled"
  | "readytosignbyseller"
  | "readytosignbysellercancel"
  | "readytosignbybuyer"
  | "readytosignbybuyercancel"
  | "auctionexpired"
  | "waitingforsale"
  | "submitted"
  | "confirmed"
  | "waitingforlockada";

export type GetNmkrPayStatusResponse = {
  paymentTransactionUid?: string;
  projectUid?: string;
  customProperties?: Record<string, string>;
  state: PaymentTransactionState;
  paymentTransactionCreated: string;
  customeripaddress?: string;
  referer?: string;
  txHash?: string;
  expires?: string;
  nmkrPayUrl?: string;
  paymentgatewayParameters?: any;
  paymentgatewayResults?: any;
  transactionType?: string;
  paymentTransactionSubstate: PaymentTransactionSubstate;
  paymentGatewayType?: string;
};

export type NmkrWebhookPayload = {
  paymentTransactionUid: string;
  projectUid: string;
  state: PaymentTransactionState;
  paymentTransactionSubstate: PaymentTransactionSubstate;
  txHash?: string;
  customProperties?: Record<string, string>;
  timestamp: string;
};

export type MintAndSendResultClass = {
  mintAndSendId?: number;
  sendedNft?: NFT[];
};

export type ReserveNftsClassV2 = {
  lovelace?: number;
  nftUid?: string;
  nftId?: number;
  tokencount?: number;
};

export type ReserveMultipleNftsClassV2 = {
  reserveNfts?: ReserveNftsClassV2[];
};

export type NFT = {
  nftId?: number;
  nftUid?: string;
  assetId?: string;
  policyId?: string;
  assetName?: string;
  fingerprint?: string;
  initialMintTxHash?: string;
  metadata?: any;
  state?: string;
  minted?: boolean;
  ipfsHash?: string;
  arweaveHash?: string;
  tokenname?: string;
  image?: string;
  mediaType?: string;
  description?: string;
  files?: any[];
};

export type CreateProjectRequest = {
  projectname?: string;
  description?: string;
  projecturl?: string;
  tokennamePrefix?: string;
  twitterHandle?: string;
  policyExpires: boolean;
  policyLocksDateTime?: string;
  payoutWalletaddress?: string;
  payoutWalletaddressUsdc?: string;
  maxNftSupply?: number;
};

export type NftProjectsDetails = {
  id?: number;
  projectUid?: string;
  projectname?: string;
  description?: string;
  projecturl?: string;
  tokennamePrefix?: string;
  twitterHandle?: string;
  policyExpires?: boolean;
  policyLocksDateTime?: string;
  payoutWalletaddress?: string;
  payoutWalletaddressUsdc?: string;
  maxNftSupply?: number;
  policyId?: string;
  addressExpiresPolicyScript?: string;
  addressExpiresStakeScript?: string;
  created?: string;
  state?: string;
};

export type UpdateMetadataRequest = {
  metadata?: any;
};

export type GetPaymentAddressForSpecificNftSaleResponse = {
  paymentAddress?: string;
  lovelaceToSend?: number;
  utxoMinAda?: number;
  validUntil?: string;
  expires?: string;
};

export type UploadToIpfsRequest = {
  mimetype?: string;
  fileFromBase64?: string;
  fileFromsUrl?: string;
  name?: string;
};

export type UploadToIpfsResponse = {
  ipfsHash?: string;
  ipfsUrl?: string;
};

//
// // Payout Wallets
// export type PayoutWallet = {
//   address: string;
//   addedAt?: string;
// };
//
// export type PaymentNotification = {
//   notificationType: "webhook";
//   notificationEndpoint: string;
//   hmacSecret?: string;
// };
//
// export type CreatePaymentTransactionRequest = {
//   projectUid: string;
//   referer?: string;
//   customerIpAddress?: string;
//   customProperties?: Record<string, string>;
//   paymentTransactionNotifications?: PaymentNotification[];
//   paymentTransactionType: "nmkr_pay_random" | "nmkr_pay_specific" | string; // 将来拡張
//   paymentgatewayParameters?: {
//     mintNfts?: {
//       countNfts?: number;
//       reserveNfts?: Array<{
//         lovelace?: number;
//         nftUid?: string;
//         tokencount?: number;
//       }>;
//     };
//     optionalRecevierAddress?: string; // ← Swaggerの綴りそのまま
//   };
// };
//
// export type CreatePaymentTransactionResponse = {
//   paymentTransactionUid: string;
//   projectUid: string;
//   customProperties?: Record<string, string>;
//   state: "active" | "pending" | "confirmed" | "finished" | "canceled" | string;
//   paymentTransactionCreated?: string; // ISO
//   customeripaddress?: string;
//   referer?: string;
//   txHash?: string;
//   expires?: string; // ISO
//   nmkrPayUrl?: string;
//
//   paymentgatewayParameters?: CreatePaymentTransactionRequest["paymentgatewayParameters"];
//   paymentgatewayResults?: {
//     mintNfts?: {
//       countNfts?: number;
//       reserveNfts?: Array<{
//         nftUid?: string;
//         tokencount?: number;
//         tokennameHex?: string;
//         policyId?: string;
//         nftId?: number;
//         lovelace?: number;
//       }>;
//     };
//     priceInLovelace?: number;
//     additionalPriceInTokens?: Array<{
//       countToken?: number;
//       policyId?: string;
//       assetNameInHex?: string;
//       multiplier?: number;
//       totalCount?: number;
//       assetName?: string;
//       decimals?: number;
//     }>;
//     stakeRewards?: number;
//     discount?: number;
//     rejectParameter?: string;
//     rejectReason?: string;
//     tokenRewards?: number;
//     fees?: number;
//     optionalReceiverAddress?: string;
//   };
//
//   transactionType?: string; // 例: "nmkr_pay_random"
//   paymentTransactionSubstate?: string; // 例: "waitingforlocknft"
//   paymentGatewayType?: string; // 例: "paymentgateway_nft_specific"
// };
