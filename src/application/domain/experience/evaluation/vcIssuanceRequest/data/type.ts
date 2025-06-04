import { User, VcIssuanceRequest } from "@prisma/client";

export interface VCClaimsData {
  [key: string]: string | number | boolean | Date | VCClaimsData | VCClaimsData[];
}

export { VcIssuanceRequest };

export type VCIssuanceRequestWithUser = VcIssuanceRequest & {
  user: User;
};

export type VCIssuanceRequestDetail = VcIssuanceRequest;

export interface VCIssuanceRequestInput {
  claims: VCClaimsData;
  credentialFormat?: 'JWT' | 'AnonCreds' | 'SDJWT';
  schemaId?: string;
}

export interface VCJobStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: {
    recordId: string;
  };
  errorReason?: string;
}
