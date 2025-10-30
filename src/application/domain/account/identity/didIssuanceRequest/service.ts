import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { IDIDIssuanceRequestRepository } from "@/application/domain/account/identity/didIssuanceRequest/data/interface";
import IdentityService from "@/application/domain/account/identity/service";
import IdentityRepository from "@/application/domain/account/identity/data/repository";
import { DidIssuanceRequest, DidIssuanceStatus, Identity } from "@prisma/client";

@injectable()
export class DIDIssuanceService {
  constructor(
    @inject("IdentityService") private readonly identityService: IdentityService,
    @inject("IdentityRepository") private readonly identityRepository: IdentityRepository,
    @inject("DIDVCServerClient") private readonly client: DIDVCServerClient,
    @inject("DIDIssuanceRequestRepository")
    private readonly didIssuanceRequestRepository: IDIDIssuanceRequestRepository,
  ) {}

  async requestDIDIssuance(
    userId: string,
    phoneUid: string,
    ctx: IContext,
    existingRequestId?: string,
  ): Promise<{ success: boolean; requestId: string; jobId?: string }> {
    const identity = await this.identityRepository.find(phoneUid);
    if (!identity) throw new Error("No identity found for DID issuance");

    let didRequest: DidIssuanceRequest | null = null;

    if (existingRequestId) {
      const existing = await this.didIssuanceRequestRepository.findById(ctx, existingRequestId);
      if (!existing) {
        logger.warn("DIDIssuanceService: missing existingRequestId, skipping");
        return {
          success: false,
          requestId: existingRequestId,
        };
      }
      didRequest = existing;
    } else {
      didRequest = await this.didIssuanceRequestRepository.create(ctx, {
        userId,
        status: DidIssuanceStatus.PENDING,
      });
    }

    let { token, isValid } = this.evaluateTokenValidity(identity);

    if (!isValid && identity.refreshToken) {
      const refreshed = await this.refreshAuthToken(phoneUid, identity.refreshToken);
      if (refreshed) {
        token = refreshed.authToken;
        isValid = true;
      } else {
        logger.warn("Token refresh failed, proceeding with existing token");
      }
    }

    if (!token) {
      logger.warn(`No authentication token available for user ${userId}, skipping DID issuance`);
      await this.didIssuanceRequestRepository.update(ctx, didRequest.id, {
        errorMessage: "No authentication token available",
        retryCount: { increment: 1 },
      });
      return { success: true, requestId: didRequest.id };
    }

    try {
      const response = await this.client.call<{ jobId: string }>(
        phoneUid,
        token,
        "/did/job/create-and-publish",
        "POST",
      );

      if (!response?.jobId) {
        logger.warn(`DID issuance failed: no jobId returned for user ${userId}`);
        await this.didIssuanceRequestRepository.update(ctx, didRequest.id, {
          errorMessage: "External API call returned no jobId",
          retryCount: { increment: 1 },
        });
        return { success: false, requestId: didRequest.id };
      }

      await this.didIssuanceRequestRepository.update(ctx, didRequest.id, {
        status: DidIssuanceStatus.PROCESSING,
        jobId: response.jobId,
        processedAt: new Date(),
      });

      return { success: true, requestId: didRequest.id, jobId: response.jobId };
    } catch (error) {
      return this.markIssuanceFailed(ctx, didRequest.id, error);
    }
  }

  evaluateTokenValidity(identity: Identity): {
    token: string | null;
    isValid: boolean;
  } {
    if (!identity.authToken) {
      return { token: null, isValid: false };
    }

    if (!identity.tokenExpiresAt) {
      return { token: identity.authToken, isValid: false };
    }

    const now = new Date();
    const isExpired = identity.tokenExpiresAt < now;

    return {
      token: identity.authToken,
      isValid: !isExpired,
    };
  }

  private async markIssuanceFailed(
    ctx: IContext,
    requestId: string,
    error: unknown,
  ): Promise<{ success: false; requestId: string }> {
    await this.didIssuanceRequestRepository.update(ctx, requestId, {
      status: DidIssuanceStatus.FAILED,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });

    logger.error("DIDIssuanceService.requestDIDIssuance: failed", error);
    return { success: false, requestId };
  }

  async refreshAuthToken(
    uid: string,
    refreshToken: string,
  ): Promise<{ authToken: string; refreshToken: string; expiryTime: Date } | null> {
    try {
      const response = await this.identityService.fetchNewIdToken(refreshToken);

      if (!response) {
        logger.warn(`Token refresh failed for uid ${uid}, continuing without refresh`);
        return null;
      }

      const expiryTime = new Date(Date.now() + response.expiresIn * 1000);

      await this.identityService.storeAuthTokens(
        uid,
        response.idToken,
        response.refreshToken,
        expiryTime,
      );

      return {
        authToken: response.idToken,
        refreshToken: response.refreshToken,
        expiryTime,
      };
    } catch (error) {
      logger.warn(
        `DIDIssuanceService.refreshAuthToken failed for uid ${uid} (non-blocking):`,
        error,
      );
      return null;
    }
  }
}
