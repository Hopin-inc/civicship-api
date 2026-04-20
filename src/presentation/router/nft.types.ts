import type { NftSyncItem } from "@/application/domain/account/nft-wallet/service";

export type { NftSyncItem };

/**
 * POST /api/nfts/sync — request body.
 *
 * Caller (外部ミントシステム) が送る payload の契約。
 * `nfts` の各要素は {@link NftSyncItem} を参照。
 */
export type SyncNftsRequestBody = {
  walletAddress: string;
  nfts: NftSyncItem[];
};

/** 200 — payload を永続化できた */
export type SyncNftsSuccessResponse = {
  success: true;
  processed: number;
};

/** 400 — payload が契約に合致しない */
export type SyncNftsInvalidPayloadResponse = {
  error: string;
  errors: string[];
};

/** 403 — 指定 walletAddress が別ユーザーに紐付いている */
export type SyncNftsForbiddenResponse = {
  error: string;
};

/** 500 — 予期せぬサーバーエラー */
export type SyncNftsServerErrorResponse = {
  error: string;
};

export type SyncNftsResponse =
  | SyncNftsSuccessResponse
  | SyncNftsInvalidPayloadResponse
  | SyncNftsForbiddenResponse
  | SyncNftsServerErrorResponse;
