import { DIDIssuanceRequest, User, Identity } from "@prisma/client";

export type DIDIssuanceRequestWithUser = DIDIssuanceRequest & {
  user: User & {
    identities: Identity[];
  };
};

export type DIDIssuanceRequestDetail = DIDIssuanceRequest;
