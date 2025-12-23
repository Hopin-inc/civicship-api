export type InputRecord = {
  phoneNumber: string;
  nftSequence: number;
  name: string;
};

export type WalletSuccess = {
  kind: "success";
  phoneNumber: string;
  nftSequence: number;
  walletAddress: string;
  firebaseUid: string;
  userId: string;
  isConfirmed: boolean;
};

export type WalletFirebaseNotFound = {
  kind: "firebaseNotFound";
  phoneNumber: string;
  nftSequence: number;
  name: string;
  error: string;
};

export type WalletCreationFailed = {
  kind: "walletCreationFailed";
  phoneNumber: string;
  nftSequence: number;
  firebaseUid: string;
  error: string;
};

export type WalletResult = WalletSuccess | WalletFirebaseNotFound | WalletCreationFailed;

export type ProcessingResult = {
  success: WalletSuccess[];
  firebaseNotFound: WalletFirebaseNotFound[];
  walletCreationFailed: WalletCreationFailed[];
};
