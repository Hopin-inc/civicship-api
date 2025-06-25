import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { IDIDIssuanceRequestRepository } from "@/application/domain/account/identity/didIssuanceRequest/data/interface";
import IdentityService from "@/application/domain/account/identity/service";
import IdentityRepository from "@/application/domain/account/identity/data/repository";
import { DidIssuanceStatus, Identity } from "@prisma/client";

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
  ): Promise<{ success: boolean; requestId: string; jobId?: string }> {
    const identity = await this.identityRepository.find(phoneUid);
    if (!identity) throw new Error("No identity found for DID issuance");

    let { token, isValid } = this.evaluateTokenValidity(identity);

    if (!isValid && identity.refreshToken) {
      try {
        const refreshed = await this.refreshAuthToken(phoneUid, identity.refreshToken);
        token = refreshed.authToken;
        isValid = true;
      } catch (error) {
        logger.error("DIDIssuanceService.refreshAuthToken failed", error);
        return this.markIssuanceFailed(ctx, userId, error);
      }
    }

    if (!token || !isValid) {
      throw new Error("No valid authentication token available");
    }

    const didRequest = await this.didIssuanceRequestRepository.create(ctx, {
      userId,
      status: DidIssuanceStatus.PENDING,
    });

    try {
      const response = await this.client.call<{ jobId: string }>(
        phoneUid,
        token,
        "/did/jobs/create-and-publish",
        "POST",
        { userId, requestId: didRequest.id },
      );

      if (response?.jobId) {
        await this.didIssuanceRequestRepository.update(ctx, didRequest.id, {
          status: DidIssuanceStatus.PROCESSING,
          jobId: response.jobId,
        });

        return { success: true, requestId: didRequest.id, jobId: response.jobId };
      }

      return { success: true, requestId: didRequest.id };
    } catch (error) {
      return this.markIssuanceFailed(ctx, didRequest.id, error);
    }
  }

  evaluateTokenValidity(identity: Identity): {
    token: string | null;
    isValid: boolean;
  } {
    if (!identity.authToken || !identity.tokenExpiresAt) {
      return { token: null, isValid: false };
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
  ): Promise<{ authToken: string; refreshToken: string; expiryTime: Date }> {
    try {
      const response = await this.identityService.fetchNewIdToken(refreshToken);

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
      logger.error(`DIDIssuanceService.refreshAuthToken failed for uid ${uid}:`, error);
      throw error;
    }
  }
}
