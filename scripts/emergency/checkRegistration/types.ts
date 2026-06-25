export type CheckInputRecord = {
  phoneNumber: string; // E.164 (+81...)
  name: string;
  nftSequences: number[];
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
