import { injectable } from "tsyringe";
import { Prisma, VcIssuanceStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  VCIssuanceRequestWithUser,
  VCClaimsData,
  vcIssuanceRequestSelectDetail,
  vcIssuanceRequestIncludeWithUser,
} from "./type";
import { IVCIssuanceRequestRepository } from "./interface";

@injectable()
export class VCIssuanceRequestRepository implements IVCIssuanceRequestRepository {
  async query(
    ctx: IContext,
    where: Prisma.VcIssuanceRequestWhereInput,
    orderBy: Prisma.VcIssuanceRequestOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.vcIssuanceRequest.findMany({
        where,
        orderBy,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        select: vcIssuanceRequestSelectDetail,
      });
    });
  }

  async findById(ctx: IContext, id: string) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.vcIssuanceRequest.findUnique({
        where: { id },
        select: vcIssuanceRequestSelectDetail,
      });
    });
  }

  async findPending(
    ctx: IContext,
    maxRetries: number,
    limit?: number,
  ): Promise<VCIssuanceRequestWithUser[]> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.vcIssuanceRequest.findMany({
        where: {
          status: VcIssuanceStatus.PENDING,
          retryCount: {
            lt: maxRetries,
          },
        },
        include: vcIssuanceRequestIncludeWithUser,
        orderBy: {
          requestedAt: "asc",
        },
        take: limit,
      });
    });
  }

  async create(
    ctx: IContext,
    data: {
      userId: string;
      evaluationId: string;
      claims: VCClaimsData;
      credentialFormat?: string;
      schemaId?: string;
      status?: VcIssuanceStatus;
    },
  ) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.vcIssuanceRequest.create({
        data: {
          evaluationId: data.evaluationId,
          userId: data.userId,
          claims: data.claims,
          credentialFormat: data.credentialFormat,
          schemaId: data.schemaId,
          status: data.status || VcIssuanceStatus.PENDING,
        },
        select: vcIssuanceRequestSelectDetail,
      });
    });
  }

  async update(
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
  ) {
    if (tx) {
      return tx.vcIssuanceRequest.update({
        where: { id },
        data: {
          status: data.status,
          jobId: data.jobId,
          vcRecordId: data.vcRecordId,
          errorMessage: data.errorMessage,
          processedAt: data.processedAt,
          completedAt: data.completedAt,
          retryCount: data.retryCount,
        },
        select: vcIssuanceRequestSelectDetail,
      });
    }

    return ctx.issuer.public(ctx, (tx) => {
      return tx.vcIssuanceRequest.update({
        where: { id },
        data: {
          status: data.status,
          jobId: data.jobId,
          vcRecordId: data.vcRecordId,
          errorMessage: data.errorMessage,
          processedAt: data.processedAt,
          completedAt: data.completedAt,
          retryCount: data.retryCount,
        },
        select: vcIssuanceRequestSelectDetail,
      });
    });
  }
}
