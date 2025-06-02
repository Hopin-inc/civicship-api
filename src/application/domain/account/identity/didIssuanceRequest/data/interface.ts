import { IContext } from "@/types/server";
import { DidIssuanceStatus, Prisma } from "@prisma/client";
import {
  DIDIssuanceRequestDetail,
  DIDIssuanceRequestWithUser,
} from "@/application/domain/account/identity/didIssuanceRequest/data/type";

export interface IDIDIssuanceRequestRepository {
  findLatestCompletedByUserId(
    ctx: IContext,
    userId: string,
  ): Promise<DIDIssuanceRequestDetail | null>;

  findById(ctx: IContext, id: string): Promise<DIDIssuanceRequestDetail | null>;

  findPending(
    ctx: IContext,
    maxRetries: number,
    limit?: number,
  ): Promise<DIDIssuanceRequestWithUser[]>;

  findExceededRetries(ctx: IContext, retryCount: number): Promise<DIDIssuanceRequestDetail[]>;

  create(
    ctx: IContext,
    data: {
      userId: string;
      status?: DidIssuanceStatus;
    },
  ): Promise<DIDIssuanceRequestDetail>;

  update(
    ctx: IContext,
    id: string,
    data: {
      status?: DidIssuanceStatus;
      didValue?: string;
      errorMessage?: string;
      processedAt?: Date;
      completedAt?: Date;
      retryCount?: number | { increment: number };
    },
    tx?: Prisma.TransactionClient,
  ): Promise<DIDIssuanceRequestDetail>;

  updateMany(
    ctx: IContext,
    ids: string[],
    data: {
      status?: DidIssuanceStatus;
      errorMessage?: string;
    },
  ): Promise<void>;
}
