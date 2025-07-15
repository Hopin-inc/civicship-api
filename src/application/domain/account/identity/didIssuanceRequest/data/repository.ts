import { injectable, container } from "tsyringe";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { DidIssuanceStatus, IdentityPlatform, Prisma } from "@prisma/client";
import { IDIDIssuanceRequestRepository } from "@/application/domain/account/identity/didIssuanceRequest/data/interface";
import {
  DIDIssuanceRequestDetail,
  DIDIssuanceRequestWithUser,
} from "@/application/domain/account/identity/didIssuanceRequest/data/type";

@injectable()
export default class DIDIssuanceRequestRepository implements IDIDIssuanceRequestRepository {
  private getIssuer(): PrismaClientIssuer {
    return container.resolve<PrismaClientIssuer>("prismaClientIssuer");
  }

  async findLatestCompletedByUserId(
    ctx: IContext,
    userId: string,
  ): Promise<DIDIssuanceRequestDetail | null> {
    const issuer = ctx.issuer || this.getIssuer();
    return issuer.public(ctx, (tx) => {
      return tx.didIssuanceRequest.findFirst({
        where: {
          userId,
          status: DidIssuanceStatus.COMPLETED,
        },
        orderBy: {
          completedAt: "desc",
        },
      });
    });
  }

  async findById(ctx: IContext, id: string): Promise<DIDIssuanceRequestDetail | null> {
    const issuer = ctx.issuer || this.getIssuer();
    return issuer.public(ctx, (tx) => {
      return tx.didIssuanceRequest.findUnique({
        where: { id },
      });
    });
  }

  async findPending(
    ctx: IContext,
    maxRetries: number,
    limit?: number,
  ): Promise<DIDIssuanceRequestWithUser[]> {
    const issuer = ctx.issuer || this.getIssuer();
    return issuer.public(ctx, (tx) => {
      return tx.didIssuanceRequest.findMany({
        where: {
          status: DidIssuanceStatus.PENDING,
          retryCount: { lt: maxRetries },
        },
        take: limit,
        include: {
          user: {
            include: {
              identities: {
                where: {
                  platform: IdentityPlatform.PHONE,
                },
              },
            },
          },
        },
      });
    });
  }

  async findExceededRetries(
    ctx: IContext,
    retryCount: number,
  ): Promise<DIDIssuanceRequestDetail[]> {
    const issuer = ctx.issuer || this.getIssuer();
    return issuer.public(ctx, (tx) => {
      return tx.didIssuanceRequest.findMany({
        where: {
          status: DidIssuanceStatus.PENDING,
          retryCount: { gte: retryCount },
        },
      });
    });
  }

  async create(
    ctx: IContext,
    data: {
      userId: string;
      status?: DidIssuanceStatus;
    },
  ): Promise<DIDIssuanceRequestDetail> {
    const issuer = ctx.issuer || this.getIssuer();
    return issuer.public(ctx, (tx) => {
      return tx.didIssuanceRequest.create({
        data: {
          userId: data.userId,
          status: data.status || DidIssuanceStatus.PENDING,
        },
      });
    });
  }

  async update(
    ctx: IContext,
    id: string,
    data: {
      status?: DidIssuanceStatus;
      jobId?: string;
      didValue?: string;
      errorMessage?: string;
      processedAt?: Date;
      completedAt?: Date;
      retryCount?: number | { increment: number };
    },
    tx?: Prisma.TransactionClient,
  ): Promise<DIDIssuanceRequestDetail> {
    if (tx) {
      return tx.didIssuanceRequest.update({
        where: { id },
        data,
      });
    }

    const issuer = ctx.issuer || this.getIssuer();
    return issuer.public(ctx, (tx) => {
      return tx.didIssuanceRequest.update({
        where: { id },
        data,
      });
    });
  }

  async updateMany(
    ctx: IContext,
    ids: string[],
    data: {
      status?: DidIssuanceStatus;
      errorMessage?: string;
    },
  ): Promise<void> {
    const issuer = ctx.issuer || this.getIssuer();
    await issuer.public(ctx, (tx) => {
      return tx.didIssuanceRequest.updateMany({
        where: {
          id: {
            in: ids,
          },
        },
        data,
      });
    });
  }
}
