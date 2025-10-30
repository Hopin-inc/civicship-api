import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { IDIDIssuanceRequestRepository } from "@/application/domain/account/identity/didIssuanceRequest/data/interface";
import IdentityService from "@/application/domain/account/identity/service";
import IdentityRepository from "@/application/domain/account/identity/data/repository";
import { DidIssuanceRequest, DidIssuanceStatus, Identity, User } from "@prisma/client";
import { classifyError, PERMANENTLY_FAILED_RETRY_COUNT } from "@/infrastructure/utils/errorClassifier";

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
        retryCount: didRequest.retryCount + 1,
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
          retryCount: didRequest.retryCount + 1,
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

    if (!isValid && phoneIdentity.refreshToken) {
      const refreshed = await this.refreshAuthToken(
        phoneIdentity.uid,
        phoneIdentity.refreshToken,
      );

      if (refreshed) {
        token = refreshed.authToken;
        isValid = true;
      } else {
        logger.warn(`Token refresh failed for ${phoneIdentity.uid}`);
        await this.didIssuanceRequestRepository.update(ctx, request.id, {
          retryCount: request.retryCount + 1,
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
          retryCount: request.retryCount + 1,
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
        retryCount: request.retryCount + 1,
      });
      return { success: true, status: "retrying" };
    } catch (error) {
      // エラー分類
      const classified = classifyError(error, !!token);

      // 詳細ログ（400系エラーの場合はリクエスト詳細も含める）
      if (classified.requestDetails) {
        logger.error(`💥 Error in DID request ${request.id} with request details:`, {
          requestId: request.id,
          userId: request.userId,
          jobId: request.jobId,
          category: classified.category,
          httpStatus: classified.httpStatus,
          message: classified.message,
          url: classified.requestDetails.url,
          method: classified.requestDetails.method,
          hasToken: classified.requestDetails.hasToken,
          requestData: classified.requestDetails.requestData,
          responseData: classified.requestDetails.responseData,
        });
      } else {
        logger.error(`💥 Error in DID request ${request.id}:`, {
          requestId: request.id,
          userId: request.userId,
          jobId: request.jobId,
          category: classified.category,
          httpStatus: classified.httpStatus,
          message: classified.message,
        });
      }

      if (!classified.shouldRetry) {
        // リトライ不要なエラー → 即座にFAILED
        // エラーメッセージには必要最小限の情報のみを保存（DBサイズ制限対策）
        // 詳細なrequestData/responseDataは上記のlogger.errorで出力済み
        const errorMessage = classified.requestDetails
          ? JSON.stringify({
              category: classified.category,
              status: classified.httpStatus,
              message: classified.message,
              url: classified.requestDetails.url,
              method: classified.requestDetails.method,
              hasToken: classified.requestDetails.hasToken,
            })
          : `${classified.category} (HTTP ${classified.httpStatus || "unknown"}): ${classified.message}`;

        await this.didIssuanceRequestRepository.update(ctx, request.id, {
          status: DidIssuanceStatus.FAILED,
          errorMessage,
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
          errorMessage: `${classified.category} (HTTP ${classified.httpStatus || "unknown"}): ${classified.message} (max retries exceeded)`,
          retryCount: newRetryCount,
        });
        return { success: false, status: "failed" };
      }

      // まだリトライ可能
      await this.didIssuanceRequestRepository.update(ctx, request.id, {
        retryCount: newRetryCount,
        errorMessage: `${classified.category} (HTTP ${classified.httpStatus || "unknown"}): ${classified.message}`,
      });
      return { success: false, status: "retrying" };
    }
  }
}
