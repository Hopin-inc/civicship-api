import axios from "axios";
import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import { IDENTUS_API_URL } from "@/consts/utils";
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
    @inject("didIssuanceRequestRepository")
    private readonly didIssuanceRequestRepository: IDIDIssuanceRequestRepository,
  ) {}

  async requestDIDIssuance(
    userId: string,
    phoneUid: string,
    ctx: IContext,
  ): Promise<{ success: boolean; requestId: string }> {
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
        });

        const didValue = await this.waitForDidCompletion(phoneUid, token, response.jobId);
        
        if (didValue) {
          await this.didIssuanceRequestRepository.update(ctx, didRequest.id, {
            status: DidIssuanceStatus.COMPLETED,
            didValue: didValue,
            completedAt: new Date(),
          });
          return { success: true, requestId: didRequest.id };
        }
      }

      return { success: true, requestId: didRequest.id };
    } catch (error) {
      return this.markIssuanceFailed(ctx, didRequest.id, error);
    }
  }

  private evaluateTokenValidity(identity: Identity): {
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

  private async waitForDidCompletion(
    phoneUid: string,
    token: string,
    jobId: string,
    maxRetries: number = 30,
    retryDelay: number = 2000,
  ): Promise<string | null> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const jobStatus = await this.client.call<{
          status: string;
          result?: { did: string };
        }>(phoneUid, token, `/did/jobs/${jobId}`, "GET");

        if (jobStatus?.status === "completed" && jobStatus.result?.did) {
          return jobStatus.result.did;
        }

        if (jobStatus?.status === "failed") {
          throw new Error("DID job failed");
        }

        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    try {
      const didData = await this.client.call<{ did: string }>(
        phoneUid,
        token,
        "/did/status",
        "GET"
      );
      return didData?.did || null;
    } catch (error) {
      return null;
    }
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
      const response = await axios.post(`${IDENTUS_API_URL}/auth/refresh`, {
        refreshToken,
      });

      const { token, refreshToken: newRefreshToken, expiresIn } = response.data;

      const expiryTime = new Date(Date.now() + expiresIn * 1000);

      await this.identityService.storeAuthTokens(uid, token, newRefreshToken, expiryTime);

      return {
        authToken: token,
        refreshToken: newRefreshToken,
        expiryTime,
      };
    } catch (error) {
      logger.error("DIDIssuanceService.refreshAuthToken: failed", error);
      throw new Error("Failed to refresh authentication token");
    }
  }
}
