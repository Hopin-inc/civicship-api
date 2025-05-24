import { IContext } from "@/types/server";
import { DIDIssuanceStatus } from "@prisma/client";

export interface IDIDIssuanceRequestRepository {
  findById(ctx: IContext, id: string): Promise<any>;
  
  findPending(
    ctx: IContext, 
    maxRetries: number, 
    limit?: number
  ): Promise<any[]>;
  
  findExceededRetries(
    ctx: IContext, 
    retryCount: number
  ): Promise<any[]>;
  
  create(
    ctx: IContext, 
    data: { 
      userId: string, 
      status?: DIDIssuanceStatus 
    }
  ): Promise<any>;
  
  update(
    ctx: IContext, 
    id: string, 
    data: {
      status?: DIDIssuanceStatus,
      didValue?: string,
      errorMessage?: string,
      processedAt?: Date,
      completedAt?: Date,
      retryCount?: number | { increment: number }
    },
    tx?: any
  ): Promise<any>;
  
  updateMany(
    ctx: IContext, 
    ids: string[], 
    data: {
      status?: DIDIssuanceStatus,
      errorMessage?: string
    }
  ): Promise<void>;
}
