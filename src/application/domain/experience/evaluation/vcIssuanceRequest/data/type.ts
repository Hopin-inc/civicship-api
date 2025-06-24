import { Prisma } from "@prisma/client";

export interface VCClaimsData {
  [key: string]: string | number | boolean | Date | VCClaimsData | VCClaimsData[];
}

export interface VCIssuanceRequestInput {
  claims: VCClaimsData;
  credentialFormat?: "JWT" | "AnonCreds" | "SDJWT";
  schemaId?: string;
}

export interface VCJobStatusResponse {
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  result?: {
    recordId: string;
  };
  errorReason?: string;
}

export const vcIssuanceRequestIncludeWithUser = Prisma.validator<Prisma.VcIssuanceRequestInclude>()(
  { user: true },
);

export type VCIssuanceRequestWithUser = Prisma.VcIssuanceRequestGetPayload<{
  include: typeof vcIssuanceRequestIncludeWithUser;
}>;

export const vcIssuanceRequestSelectDetail = Prisma.validator<Prisma.VcIssuanceRequestSelect>()({
  id: true,
  status: true,

  evaluationId: true,
  userId: true,

  createdAt: true,
  updatedAt: true,
});

export type PrismaVCIssuanceRequestDetail = Prisma.VcIssuanceRequestGetPayload<{
  select: typeof vcIssuanceRequestSelectDetail;
}>;
