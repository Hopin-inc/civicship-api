export type InputRecord = {
  phoneNumber: string;
  nftSequence: number;
  name: string;
};

export type WalletSuccess = {
  kind: "success";
  phoneNumber: string;
  nftSequence: number;
  name: string;
  walletAddress: string;
  firebaseUid: string;
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
  name: string;
  firebaseUid: string;
  error: string;
};

export type UserNotFound = {
  kind: "userNotFound";
  phoneNumber: string;
  nftSequence: number;
  name: string;
  firebaseUid: string;
};

export type WalletResult = WalletSuccess | WalletFirebaseNotFound | WalletCreationFailed | UserNotFound;

export type ProcessingResult = {
  success: WalletSuccess[];
  firebaseNotFound: WalletFirebaseNotFound[];
  userNotFound: UserNotFound[];
  walletCreationFailed: WalletCreationFailed[];
};
