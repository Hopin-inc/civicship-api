import { User, Identity, DidIssuanceRequest } from "@prisma/client";

export type DIDIssuanceRequestWithUser = DidIssuanceRequest & {
  user: User & {
    identities: Identity[];
  };
};

export type DIDIssuanceRequestDetail = DidIssuanceRequest;
