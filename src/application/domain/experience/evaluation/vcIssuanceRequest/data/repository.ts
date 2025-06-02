import { injectable, container } from "tsyringe";
import { Prisma, VcIssuanceStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { VCIssuanceRequestDetail, VCIssuanceRequestWithUser, VCClaimsData } from "./type";
import { IVCIssuanceRequestRepository } from "./interface";

@injectable()
export class VCIssuanceRequestRepository implements IVCIssuanceRequestRepository {
  private getIssuer(): PrismaClientIssuer {
    return container.resolve<PrismaClientIssuer>("prismaClientIssuer");
  }

  async findById(ctx: IContext, id: string): Promise<VCIssuanceRequestDetail | null> {
    const issuer = ctx.issuer || this.getIssuer();
    return issuer.public(ctx, (tx) => {
      return tx.vcIssuanceRequest.findUnique({
        where: { id },
      });
    });
  }

  async findPending(
    ctx: IContext,
    maxRetries: number,
    limit?: number
  ): Promise<VCIssuanceRequestWithUser[]> {
    const issuer = ctx.issuer || this.getIssuer();
    return issuer.public(ctx, (tx) => {
      return tx.vcIssuanceRequest.findMany({
        where: {
          status: VcIssuanceStatus.PENDING,
          retryCount: {
            lt: maxRetries,
          },
        },
        include: {
          user: true,
        },
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
      claims: VCClaimsData;
      credentialFormat?: string;
      schemaId?: string;
      status?: VcIssuanceStatus;
    }
  ): Promise<VCIssuanceRequestDetail> {
    const issuer = ctx.issuer || this.getIssuer();
    return issuer.public(ctx, (tx) => {
      return tx.vcIssuanceRequest.create({
        data: {
          userId: data.userId,
          claims: data.claims,
          credentialFormat: data.credentialFormat,
          schemaId: data.schemaId,
          status: data.status || VcIssuanceStatus.PENDING,
        },
      });
    });
  }

  async update(
    ctx: IContext,
    id: string,
    data: {
      status?: VcIssuanceStatus;
      vcRecordId?: string;
      errorMessage?: string;
      processedAt?: Date;
      completedAt?: Date;
      retryCount?: number | { increment: number };
    },
    tx?: Prisma.TransactionClient
  ): Promise<VCIssuanceRequestDetail> {
    if (tx) {
      return tx.vcIssuanceRequest.update({
        where: { id },
        data: {
          status: data.status,
          vcRecordId: data.vcRecordId,
          errorMessage: data.errorMessage,
          processedAt: data.processedAt,
          completedAt: data.completedAt,
          retryCount: data.retryCount,
        },
      });
    }

    const issuer = ctx.issuer || this.getIssuer();
    return issuer.public(ctx, (tx) => {
      return tx.vcIssuanceRequest.update({
        where: { id },
        data: {
          status: data.status,
          vcRecordId: data.vcRecordId,
          errorMessage: data.errorMessage,
          processedAt: data.processedAt,
          completedAt: data.completedAt,
          retryCount: data.retryCount,
        },
      });
    });
  }
}
