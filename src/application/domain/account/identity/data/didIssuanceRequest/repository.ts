import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { DIDIssuanceStatus } from "@prisma/client";
import { IDIDIssuanceRequestRepository } from "./interface";
import { DIDIssuanceRequestWithUser, DIDIssuanceRequestDetail } from "./type";

@injectable()
export default class DIDIssuanceRequestRepository implements IDIDIssuanceRequestRepository {
  async findById(ctx: IContext, id: string): Promise<DIDIssuanceRequestDetail | null> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.dIDIssuanceRequest.findUnique({
        where: { id }
      });
    });
  }
  
  async findPending(
    ctx: IContext, 
    maxRetries: number, 
    limit?: number
  ): Promise<DIDIssuanceRequestWithUser[]> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.dIDIssuanceRequest.findMany({
        where: {
          status: 'PENDING',
          retryCount: { lt: maxRetries }
        },
        take: limit,
        include: {
          user: {
            include: {
              identities: {
                where: {
                  platform: 'PHONE'
                }
              }
            }
          }
        }
      });
    });
  }
  
  async findExceededRetries(
    ctx: IContext, 
    retryCount: number
  ): Promise<DIDIssuanceRequestDetail[]> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.dIDIssuanceRequest.findMany({
        where: {
          status: 'PENDING',
          retryCount: { gte: retryCount }
        }
      });
    });
  }
  
  async create(
    ctx: IContext, 
    data: { 
      userId: string, 
      status?: DIDIssuanceStatus 
    }
  ): Promise<DIDIssuanceRequestDetail> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.dIDIssuanceRequest.create({
        data: {
          userId: data.userId,
          status: data.status || 'PENDING'
        }
      });
    });
  }
  
  async update(
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
  ): Promise<DIDIssuanceRequestDetail> {
    if (tx) {
      return tx.dIDIssuanceRequest.update({
        where: { id },
        data
      });
    }
    
    return ctx.issuer.public(ctx, (tx) => {
      return tx.dIDIssuanceRequest.update({
        where: { id },
        data
      });
    });
  }
  
  async updateMany(
    ctx: IContext, 
    ids: string[], 
    data: {
      status?: DIDIssuanceStatus,
      errorMessage?: string
    }
  ): Promise<void> {
    await ctx.issuer.public(ctx, (tx) => {
      return tx.dIDIssuanceRequest.updateMany({
        where: {
          id: {
            in: ids
          }
        },
        data
      });
    });
  }
}
