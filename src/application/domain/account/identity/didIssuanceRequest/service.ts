import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { IDIDIssuanceRequestRepository } from "@/application/domain/account/identity/didIssuanceRequest/data/interface";
import IdentityService from "@/application/domain/account/identity/service";
import IdentityRepository from "@/application/domain/account/identity/data/repository";
import { DidIssuanceRequest, DidIssuanceStatus, Identity, User } from "@prisma/client";
import {
  classifyError,
  ClassifiedError,
  ErrorCategory,
  PERMANENTLY_FAILED_RETRY_COUNT,
} from "@/infrastructure/utils/errorClassifier";
import { maskSensitiveData } from "@/infrastructure/utils/maskSensitiveData";

type DidIssuanceRequestWithUser = DidIssuanceRequest & {
  user: User & {
    identities: Identity[];
  };
};

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
    let refreshAttempted = false;
    let refreshSucceeded = false;

    if (!isValid && identity.refreshToken) {
      refreshAttempted = true;
      const refreshed = await this.refreshAuthToken(phoneUid, identity.refreshToken);
      if (refreshed) {
        token = refreshed.authToken;
        isValid = true;
        refreshSucceeded = true;
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
      const classified = classifyError(error, !!token);
      const errorContext = this.buildErrorContext(
        classified,
        token,
        isValid,
        identity,
        didRequest.id,
        userId,
        refreshAttempted,
        refreshSucceeded,
      );
      logger.error(`💥 Error in DID request:`, errorContext);

      await this.didIssuanceRequestRepository.update(ctx, didRequest.id, {
        status: DidIssuanceStatus.FAILED,
        errorMessage: this.buildDbErrorMessage(classified),
        retryCount: { increment: 1 },
      });

      return { success: false, requestId: didRequest.id };
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

  private buildErrorContext(
    classified: ClassifiedError,
    token: string | null,
    isValid: boolean,
    identity: Identity,
    requestId: string,
    userId: string,
    refreshAttempted: boolean,
    refreshSucceeded: boolean,
  ) {
    const tokenStatus = !token ? "MISSING" : !isValid ? "EXPIRED" : "VALID";
    const refreshAttemptedStr = refreshAttempted ? "YES" : "NO";
    const refreshResult = !refreshAttempted ? "N/A" : refreshSucceeded ? "SUCCESS" : "FAILED";

    return {
      requestId,
      userId,
      category: classified.category,
      httpStatus: classified.httpStatus,
      message: classified.message,
      tokenStatus,
      refreshAttempted: refreshAttemptedStr,
      refreshResult,
      ...(classified.requestDetails && {
        url: classified.requestDetails.url,
        method: classified.requestDetails.method,
        hasToken: classified.requestDetails.hasToken,
        requestData: maskSensitiveData(classified.requestDetails.requestData),
        responseData: classified.requestDetails.responseData,
      }),
    };
  }

  private buildDbErrorMessage(classified: ClassifiedError): string {
    return classified.requestDetails
      ? `${classified.category} (HTTP ${classified.httpStatus || "unknown"}): ${classified.message} | ` +
          `URL: ${classified.requestDetails.url} | Method: ${classified.requestDetails.method} | Token: ${classified.requestDetails.hasToken ? "yes" : "no"}`
      : `${classified.category} (HTTP ${classified.httpStatus || "unknown"}): ${classified.message}`;
  }

  async resetRequestForRetry(ctx: IContext, requestId: string, reason: string): Promise<void> {
    await this.didIssuanceRequestRepository.update(ctx, requestId, {
      status: DidIssuanceStatus.PENDING,
      jobId: null,
      retryCount: 0,
      errorMessage: `Auto-reset: ${reason}`,
    });
    logger.info(`🔄 Reset request ${requestId} for retry: ${reason}`);
  }

  private async attemptDidJob404Recovery(
    ctx: IContext,
    request: DidIssuanceRequest,
    phoneIdentity: Identity,
    token: string,
  ): Promise<"completed" | "reset"> {
    logger.warn(`Job ${request.jobId} not found, attempting recovery for request ${request.id}`);

    try {
      const existingDid = await this.client.call<{ status: string; did: string }>(
        phoneIdentity.uid,
        token,
        "/did",
        "GET",
      );

      if (existingDid?.status === "PUBLISHED" && existingDid.did) {
        await this.didIssuanceRequestRepository.update(ctx, request.id, {
          status: DidIssuanceStatus.COMPLETED,
          didValue: existingDid.did,
          completedAt: new Date(),
          errorMessage: "Recovered: Job expired but DID was already published",
        });
        logger.info(`✅ DID recovered as completed: ${request.id}, didValue: ${existingDid.did}`);
        return "completed";
      }
    } catch (checkError) {
      logger.warn(`Failed to check existing DID for recovery, re-throwing`, { checkError });
      throw checkError;
    }

    logger.info(`Resetting DID request ${request.id} for retry due to job expiration`);
    await this.resetRequestForRetry(ctx, request.id, "Job expired in Redis");
    return "reset";
  }

  async syncJobStatus(
    request: DidIssuanceRequestWithUser,
    ctx: IContext,
  ): Promise<{
    success: boolean;
    status: "completed" | "failed" | "retrying" | "skipped";
  }> {
    const phoneIdentity = request.user.identities.find(
      (identity) => identity.platform === "PHONE",
    );

    if (!phoneIdentity) {
      logger.warn(`⚠️ No phone identity for user ${request.userId}`);
      return { success: false, status: "skipped" };
    }

    // トークン検証と更新
    let { token, isValid } = this.evaluateTokenValidity(phoneIdentity);
    let refreshAttempted = false;
    let refreshSucceeded = false;

    if (!isValid && phoneIdentity.refreshToken) {
      refreshAttempted = true;
      const refreshed = await this.refreshAuthToken(
        phoneIdentity.uid,
        phoneIdentity.refreshToken,
      );

      if (refreshed) {
        token = refreshed.authToken;
        isValid = true;
        refreshSucceeded = true;
      } else {
        logger.warn(
          `Token refresh failed for ${phoneIdentity.uid}, marking request ${request.id} for retry`,
        );
        await this.didIssuanceRequestRepository.update(ctx, request.id, {
          retryCount: { increment: 1 },
          errorMessage: "Token refresh failed",
        });
        return { success: false, status: "retrying" };
      }
    }

    if (!token || !isValid) {
      logger.warn(`❌ No valid token for user ${request.userId}`);
      return { success: false, status: "skipped" };
    }

    // 外部API呼び出し
    try {
      const jobStatus = await this.client.call<{
        status: string;
        result?: { did: string };
      }>(phoneIdentity.uid, token, `/did/job/${request.jobId}`, "GET");

      if (!jobStatus) {
        logger.warn(`External API returned null for job ${request.jobId}`);
        await this.didIssuanceRequestRepository.update(ctx, request.id, {
          errorMessage: "External API call failed during sync",
          retryCount: { increment: 1 },
        });
        return { success: false, status: "retrying" };
      }

      if (jobStatus.status === "completed" && jobStatus.result?.did) {
        await this.didIssuanceRequestRepository.update(ctx, request.id, {
          status: DidIssuanceStatus.COMPLETED,
          didValue: jobStatus.result.did,
          completedAt: new Date(),
        });
        logger.info(`✅ DID completed: ${request.id}`);
        return { success: true, status: "completed" };
      }

      if (jobStatus.status === "failed") {
        await this.didIssuanceRequestRepository.update(ctx, request.id, {
          status: DidIssuanceStatus.FAILED,
          errorMessage: "DID issuance failed on server",
          retryCount: PERMANENTLY_FAILED_RETRY_COUNT,
        });
        logger.error(`❌ DID failed: ${request.id}`);
        return { success: false, status: "failed" };
      }

      // Still processing
      await this.didIssuanceRequestRepository.update(ctx, request.id, {
        retryCount: { increment: 1 },
      });
      return { success: true, status: "retrying" };
    } catch (error) {
      const classified = classifyError(error, !!token);

      if (classified.category === ErrorCategory.NOT_FOUND && classified.httpStatus === 404) {
        const outcome = await this.attemptDidJob404Recovery(ctx, request, phoneIdentity, token);
        return {
          success: outcome === "completed",
          status: outcome === "completed" ? "completed" : "retrying",
        };
      }

      const errorContext = this.buildErrorContext(
        classified,
        token,
        isValid,
        phoneIdentity,
        request.id,
        request.userId,
        refreshAttempted,
        refreshSucceeded,
      );
      logger.error(`💥 Error in DID sync:`, errorContext);

      // リトライ不要なエラー → 即座にFAILED
      if (!classified.shouldRetry) {
        await this.didIssuanceRequestRepository.update(ctx, request.id, {
          status: DidIssuanceStatus.FAILED,
          errorMessage: this.buildDbErrorMessage(classified),
          retryCount: PERMANENTLY_FAILED_RETRY_COUNT,
        });
        return { success: false, status: "failed" };
      }

      // リトライ可能なエラー
      const newRetryCount = request.retryCount + 1;

      if (newRetryCount >= classified.maxRetries) {
        // リトライ回数超過 → FAILED
        await this.didIssuanceRequestRepository.update(ctx, request.id, {
          status: DidIssuanceStatus.FAILED,
          errorMessage: `${this.buildDbErrorMessage(classified)} (max retries exceeded)`,
          retryCount: newRetryCount,
        });
        return { success: false, status: "failed" };
      }

      // まだリトライ可能
      await this.didIssuanceRequestRepository.update(ctx, request.id, {
        retryCount: { increment: 1 },
        errorMessage: this.buildDbErrorMessage(classified),
      });
      return { success: false, status: "retrying" };
    }
  }
}
