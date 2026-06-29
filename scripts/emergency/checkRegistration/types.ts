export type CheckInputRecord = {
  phoneNumber: string; // E.164 (+81...) ／ 解決に失敗した場合は元の生値
  name: string;
  nftSequences: number[];
  // CSVパース時点で電話番号を正規化できなかった場合の理由。
  // セットされている場合 Firebase へは問い合わせず invalidPhone として扱う。
  invalidReason?: string;
};

export type Registered = {
  kind: "registered";
  phoneNumber: string;
  name: string;
  firebaseUid: string;
};

export type NotRegistered = {
  kind: "notRegistered";
  phoneNumber: string;
  name: string;
  error: string;
};

export type InvalidPhone = {
  kind: "invalidPhone";
  phoneNumber: string;
  name: string;
  error: string;
};

export type CheckResult = Registered | NotRegistered | InvalidPhone;

export type CheckSummary = {
  registered: Registered[];
  notRegistered: NotRegistered[];
  invalidPhone: InvalidPhone[];
};
