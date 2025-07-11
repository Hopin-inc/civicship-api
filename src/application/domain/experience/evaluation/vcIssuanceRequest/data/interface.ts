import { IContext } from "@/types/server";
import { Prisma, VcIssuanceStatus } from "@prisma/client";
import { VCIssuanceRequestWithUser, VCClaimsData, PrismaVCIssuanceRequestDetail } from "./type";

export interface IVCIssuanceRequestRepository {
  query(
    ctx: IContext,
    where: Prisma.VcIssuanceRequestWhereInput,
    orderBy: Prisma.VcIssuanceRequestOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaVCIssuanceRequestDetail[]>;

  findById(ctx: IContext, id: string): Promise<PrismaVCIssuanceRequestDetail | null>;

  findPending(
    ctx: IContext,
    maxRetries: number,
    limit?: number,
  ): Promise<VCIssuanceRequestWithUser[]>;

  create(
    ctx: IContext,
    data: {
      evaluationId: string;
      userId: string;
      claims: VCClaimsData;
      credentialFormat?: string;
      schemaId?: string;
      status?: VcIssuanceStatus;
    },
  ): Promise<PrismaVCIssuanceRequestDetail>;

  update(
    ctx: IContext,
    id: string,
    data: {
      status?: VcIssuanceStatus;
      jobId?: string;
      vcRecordId?: string;
      errorMessage?: string;
      processedAt?: Date;
      completedAt?: Date;
      retryCount?: number | { increment: number };
    },
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaVCIssuanceRequestDetail>;
}
