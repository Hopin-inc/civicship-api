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

export type CheckAddressResponse = NmkrBaseResponse & {
  state: "active" | "expired" | "finished";
  reservedNfts?: NmkrReservedNft[];
  paymentTransactionUid?: string;
  expires?: string;
};

export type GetProjectResponse = NmkrBaseResponse & {
  projectName: string;
  policyId: string;
  totalNfts: number;
  soldNfts: number;
  reservedNfts: number;
  projectDescription?: string;
  projectUrl?: string;
  enableRandom: boolean;
  enableSpecific: boolean;
};

export type CancelAddressReservationResponse = NmkrBaseResponse;

export type GetTransactionStateResponse = NmkrBaseResponse & {
  state: "pending" | "confirmed" | "finished" | "canceled" | "expired" | string;
  paymentTransactionUid: string;
  projectUid: string;
  updatedAt?: string;
  txHash?: string;
  paymentTransactionSubstate?: string;
};

export type GetPaymentAddressResponse = NmkrBaseResponse & {
  paymentAddress: string;
  expires?: string;
  qrCode?: string;
};

export type SubmitTransactionResponse = NmkrBaseResponse & {
  txHash?: string;
  state?: string;
};

export type EndTransactionResponse = NmkrBaseResponse & {
  state?: string;
  finalTxHash?: string;
};

export type CancelTransactionResponse = NmkrBaseResponse & {
  state?: string;
  canceledAt?: string;
};

export type ReservePaymentgatewayMintAndSendNftRequest = {
  receiverAddress?: string;
  metadata?: Record<string, any>;
};

export type ReservePaymentgatewayMintAndSendNftResponse = NmkrBaseResponse & {
  reservedNfts?: NmkrReservedNft[];
  state?: string;
};

export type MintAndSendPaymentgatewayNftRequest = {
  receiverAddress?: string;
  metadata?: Record<string, any>;
};

export type MintAndSendPaymentgatewayNftResponse = NmkrBaseResponse & {
  mintedNfts?: Array<{
    nftUid: string;
    txHash?: string;
    tokenname?: string;
    policyId?: string;
  }>;
  state?: string;
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
