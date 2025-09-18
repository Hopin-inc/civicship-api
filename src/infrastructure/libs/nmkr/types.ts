export type NmkrPaymentNotification = {
  notificationType: "webhook";
  notificationEndpoint: string;
  hmacSecret?: string;
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
        lovelace: number; // 価格（1ADA=1_000_000 lovelace）
        nftUid: string; // ★ NMKR上の NFT UID を指定
        tokencount: number; // 通常 1
      }>;
      countNfts?: number; // 使わない想定
    };
    optionalRecevierAddress?: string; // 受取先アドレス（指定するなら）
  };
};

export type CreatePaymentTransactionRes = {
  paymentTransactionUid: string;
  projectUid: string;
  state: string;
  nmkrPayUrl?: string; // ← 決済リンク
  expires?: string;
  transactionType?: string;
  paymentTransactionSubstate?: string;
  paymentGatewayType?: string;
  // 他フィールドは必要になったら追記
};

// // GetTransactionState
// export type GetTransactionStateOutput = {
//   state: string; // 例: "Pending" | "Confirmed" | "Finished" | "Canceled" など
//   updatedAt?: string; // あれば
// };
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
