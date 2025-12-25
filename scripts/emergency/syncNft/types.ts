export type SyncSuccess = {
  kind: "success";
  walletAddress: string;
  nftCount: number;
  syncedCount: number;
};

export type SyncNoWallet = {
  kind: "noWallet";
  userId: string;
};

export type SyncApiFailed = {
  kind: "apiFailed";
  walletAddress: string;
  error: string;
};

export type SyncDbFailed = {
  kind: "dbFailed";
  walletAddress: string;
  error: string;
};

export type SyncResult = SyncSuccess | SyncNoWallet | SyncApiFailed | SyncDbFailed;

export type SyncProcessingResult = {
  success: SyncSuccess[];
  noWallet: SyncNoWallet[];
  apiFailed: SyncApiFailed[];
  dbFailed: SyncDbFailed[];
};
