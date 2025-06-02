import { IContext } from "@/types/server";
import { Prisma, VcIssuanceStatus } from "@prisma/client";
import { VCIssuanceRequestDetail, VCIssuanceRequestWithUser, VCClaimsData } from "./type";

export interface IVCIssuanceRequestRepository {
  findById(ctx: IContext, id: string): Promise<VCIssuanceRequestDetail | null>;
  findPending(ctx: IContext, maxRetries: number, limit?: number): Promise<VCIssuanceRequestWithUser[]>;
  create(ctx: IContext, data: {
    userId: string;
    claims: VCClaimsData;
    credentialFormat?: string;
    schemaId?: string;
    status?: VcIssuanceStatus;
  }): Promise<VCIssuanceRequestDetail>;
  update(ctx: IContext, id: string, data: {
    status?: VcIssuanceStatus;
    vcRecordId?: string;
    errorMessage?: string;
    processedAt?: Date;
    completedAt?: Date;
    retryCount?: number | { increment: number };
  }, tx?: Prisma.TransactionClient): Promise<VCIssuanceRequestDetail>;
}
