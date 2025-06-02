import { injectable, inject } from "tsyringe";
import { VcIssuanceStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { IVCIssuanceRequestRepository } from "./data/interface";
import { VCIssuanceRequestInput, VCJobStatusResponse } from "./data/type";
import { IDIDIssuanceRequestRepository } from "../../../account/identity/didIssuanceRequest/data/interface";
import IdentityService from "@/application/domain/account/identity/service";
import IdentityRepository from "@/application/domain/account/identity/data/repository";
import logger from "@/infrastructure/logging";

@injectable()
export class VCIssuanceService {
  constructor(
    @inject("IdentityService") private readonly identityService: IdentityService,
    @inject("IdentityRepository") private readonly identityRepository: IdentityRepository,
    @inject("DIDVCServerClient") private readonly client: DIDVCServerClient,
    @inject("vcIssuanceRequestRepository")
    private readonly vcIssuanceRequestRepository: IVCIssuanceRequestRepository,
    @inject("didIssuanceRequestRepository")
    private readonly didIssuanceRequestRepository: IDIDIssuanceRequestRepository,
  ) {}

  async requestVCIssuance(
    userId: string,
    phoneUid: string,
    vcRequest: VCIssuanceRequestInput,
    ctx: IContext,
  ): Promise<{ success: boolean; requestId: string }> {
    const userDid = await this.getUserDid(userId, ctx);
    if (!userDid) {
      throw new Error("User DID not found. DID must be issued before VC issuance.");
    }

    const vcIssuanceRequest = await this.vcIssuanceRequestRepository.create(ctx, {
      userId,
      claims: vcRequest.claims,
      credentialFormat: vcRequest.credentialFormat,
      schemaId: vcRequest.schemaId,
      status: VcIssuanceStatus.PENDING,
    });

    const identity = await this.identityRepository.find(phoneUid);
    if (!identity) throw new Error("No identity found for VC issuance");

    let { token, isValid } = this.evaluateTokenValidity(identity);

    if (!isValid && identity.refreshToken) {
      try {
        const refreshed = await this.refreshAuthToken(phoneUid, identity.refreshToken);
        token = refreshed.authToken;
        isValid = true;
      } catch (error) {
        logger.error("VCIssuanceService.refreshAuthToken failed", error);
        return this.markIssuanceFailed(ctx, vcIssuanceRequest.id, error);
      }
    }

    if (!token || !isValid) {
      throw new Error("No valid authentication token available");
    }

    try {
      const response = await this.client.call<{ jobId: string }>(
        phoneUid,
        token,
        "/vc/jobs/connectionless/issue-to-holder",
        "POST",
        {
          issuingDID: userDid,
          claims: vcRequest.claims,
          credentialFormat: vcRequest.credentialFormat || "JWT",
          schemaId: vcRequest.schemaId,
        },
      );

      if (response?.jobId) {
        await this.vcIssuanceRequestRepository.update(ctx, vcIssuanceRequest.id, {
          status: VcIssuanceStatus.PROCESSING,
        });

        const vcRecordId = await this.waitForVcCompletion(phoneUid, token, response.jobId);

        if (vcRecordId) {
          await this.vcIssuanceRequestRepository.update(ctx, vcIssuanceRequest.id, {
            status: VcIssuanceStatus.COMPLETED,
            vcRecordId: vcRecordId,
            completedAt: new Date(),
          });
          return { success: true, requestId: vcIssuanceRequest.id };
        }
      }

      return { success: true, requestId: vcIssuanceRequest.id };
    } catch (error) {
      logger.error("VCIssuanceService.requestVCIssuance: failed", error);
      return this.markIssuanceFailed(ctx, vcIssuanceRequest.id, error);
    }
  }

  private async getUserDid(userId: string, ctx: IContext): Promise<string | null> {
    const didRequest = await this.didIssuanceRequestRepository.findLatestCompletedByUserId(
      ctx,
      userId,
    );
    return didRequest?.didValue ?? null;
  }

  private evaluateTokenValidity(identity: {
    authToken: string | null;
    tokenExpiresAt: Date | null;
  }): {
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

  private async waitForVcCompletion(
    phoneUid: string,
    token: string,
    jobId: string,
    maxRetries: number = 5,
    retryDelay: number = 10000,
  ): Promise<string | null> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const jobStatus = await this.client.call<VCJobStatusResponse>(
          phoneUid,
          token,
          `/vc/jobs/connectionless/${jobId}`,
          "GET",
        );

        if (jobStatus?.status === "completed" && jobStatus.result?.recordId) {
          return jobStatus.result.recordId;
        }

        if (jobStatus?.status === "failed") {
          logger.warn(`VC job failed: ${jobStatus.errorReason || "Unknown error"}`);
        }

        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    logger.error("VCIssuanceService.waitForVcCompletion: timeout after max retries");
    return null;
  }

  async refreshAuthToken(
    uid: string,
    refreshToken: string,
  ): Promise<{ authToken: string; refreshToken: string; expiryTime: Date }> {
    try {
      const response = await this.client.call<{
        token: string;
        refreshToken: string;
        expiresIn: number;
      }>(uid, refreshToken, "/auth/refresh", "POST");

      const { token, refreshToken: newRefreshToken, expiresIn } = response;

      const expiryTime = new Date(Date.now() + expiresIn * 1000);

      await this.identityService.storeAuthTokens(uid, token, newRefreshToken, expiryTime);

      return {
        authToken: token,
        refreshToken: newRefreshToken,
        expiryTime,
      };
    } catch (error) {
      logger.error("VCIssuanceService.refreshAuthToken: failed", error);
      throw new Error("Failed to refresh authentication token");
    }
  }

  private async markIssuanceFailed(
    ctx: IContext,
    requestId: string,
    error: unknown,
  ): Promise<{ success: boolean; requestId: string }> {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await this.vcIssuanceRequestRepository.update(ctx, requestId, {
      status: VcIssuanceStatus.FAILED,
      errorMessage,
      processedAt: new Date(),
      retryCount: { increment: 1 },
    });

    return { success: false, requestId };
  }
}
