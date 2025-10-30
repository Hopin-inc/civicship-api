import { injectable, inject } from "tsyringe";
import { VcIssuanceStatus, Prisma, User, Identity, VcIssuanceRequest } from "@prisma/client";
import { IContext } from "@/types/server";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { IVCIssuanceRequestRepository } from "./data/interface";
import { EvaluationCredentialPayload, PrismaVCIssuanceRequestDetail } from "./data/type";
import { IDIDIssuanceRequestRepository } from "../../../account/identity/didIssuanceRequest/data/interface";
import IdentityService from "@/application/domain/account/identity/service";
import IdentityRepository from "@/application/domain/account/identity/data/repository";
import logger from "@/infrastructure/logging";
import { GqlQueryVcIssuanceRequestsArgs } from "@/types/graphql";
import VCIssuanceRequestConverter from "@/application/domain/experience/evaluation/vcIssuanceRequest/data/converter";
import { classifyError, PERMANENTLY_FAILED_RETRY_COUNT } from "@/infrastructure/utils/errorClassifier";

type VcIssuanceRequestWithUser = VcIssuanceRequest & {
  user: User & {
    identities: Identity[];
  };
};

@injectable()
export class VCIssuanceRequestService {
  constructor(
    @inject("IdentityService") private readonly identityService: IdentityService,
    @inject("IdentityRepository") private readonly identityRepository: IdentityRepository,
    @inject("DIDVCServerClient") private readonly client: DIDVCServerClient,
    @inject("VCIssuanceRequestConverter")
    private readonly converter: VCIssuanceRequestConverter,
    @inject("VCIssuanceRequestRepository")
    private readonly vcIssuanceRequestRepository: IVCIssuanceRequestRepository,
    @inject("DIDIssuanceRequestRepository")
    private readonly didIssuanceRequestRepository: IDIDIssuanceRequestRepository,
  ) {}

  async fetchVcIssuanceRequests(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryVcIssuanceRequestsArgs,
    take: number,
  ): Promise<PrismaVCIssuanceRequestDetail[]> {
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});
    return await this.vcIssuanceRequestRepository.query(ctx, where, orderBy, take, cursor);
  }

  async findVcIssuanceRequest(
    ctx: IContext,
    id: string,
  ): Promise<PrismaVCIssuanceRequestDetail | null> {
    return await this.vcIssuanceRequestRepository.findById(ctx, id);
  }

  async bulkCreateVCIssuanceRequests(
    ctx: IContext,
    vcIssuanceData: Prisma.VcIssuanceRequestCreateManyInput[],
  ): Promise<Prisma.BatchPayload> {
    return this.vcIssuanceRequestRepository.createMany(ctx, vcIssuanceData);
  }

  async requestVCIssuance(
    userId: string,
    phoneUid: string,
    vcRequest: EvaluationCredentialPayload,
    ctx: IContext,
    evaluationId: string,
    existingRequestId?: string,
  ): Promise<{ success: boolean; requestId: string; jobId?: string }> {
    let vcIssuanceRequest: PrismaVCIssuanceRequestDetail | null = null;

    if (existingRequestId) {
      const existing = await this.vcIssuanceRequestRepository.findById(ctx, existingRequestId);
      if (!existing) {
        logger.warn("VCIssuanceService: missing existingRequestId, skipping");
        return this.markIssuanceStatus(
          ctx,
          existingRequestId,
          "VCIssuanceService: missing existingRequestId, skipping",
        );
      }
      vcIssuanceRequest = existing;
    } else {
      vcIssuanceRequest = await this.vcIssuanceRequestRepository.create(ctx, {
        evaluationId,
        userId,
        claims: vcRequest.claims,
        credentialFormat: "JWT",
        schemaId: vcRequest.schemaId,
        status: VcIssuanceStatus.PENDING,
      });
    }

    const identity = await this.identityRepository.find(phoneUid);
    if (!identity) throw new Error("No identity found for VC issuance");

    let { token, isValid } = this.evaluateTokenValidity(identity);

    if (!isValid && identity.refreshToken) {
      const refreshed = await this.refreshAuthToken(phoneUid, identity.refreshToken);
      if (refreshed) {
        token = refreshed.authToken;
        isValid = true;
      } else {
        logger.warn("VCIssuanceService: Token refresh failed, marking as failed");
        return this.markIssuanceStatus(ctx, vcIssuanceRequest.id, "Token refresh failed");
      }
    }

    if (!token || !isValid) {
      const reason = !identity.refreshToken
        ? "no refresh token available"
        : "token invalid and refresh failed";
      logger.warn(`No valid authentication token available: ${reason}`);
      return this.markIssuanceStatus(
        ctx,
        vcIssuanceRequest.id,
        `No valid authentication token: ${reason}`,
      );
    }

    const userDid = await this.getUserDid(userId, ctx).catch((err) => {
      logger.warn("VCIssuanceService: DID not found. VC issuance will be postponed.", {
        userId,
        error: err instanceof Error ? err.message : String(err),
      });
    });
    if (!userDid) {
      return this.markIssuanceStatus(
        ctx,
        vcIssuanceRequest.id,
        "User DID not found. VC issuance postponed.",
        VcIssuanceStatus.PENDING,
      ).then(() => ({
        success: false,
        requestId: vcIssuanceRequest.id,
      }));
    }

    try {
      const response = await this.client.call<{ jobId: string }>(
        phoneUid,
        token,
        "/vc/connectionless/job/issue-to-holder",
        "POST",
        {
          claims: vcRequest.claims,
          schemaId: vcRequest.schemaId,
        },
      );

      if (response?.jobId) {
        await this.vcIssuanceRequestRepository.update(ctx, vcIssuanceRequest.id, {
          status: VcIssuanceStatus.PROCESSING,
          jobId: response.jobId,
          processedAt: new Date(),
        });

        return { success: true, requestId: vcIssuanceRequest.id, jobId: response.jobId };
      }

      return { success: true, requestId: vcIssuanceRequest.id };
    } catch (error) {
      logger.error("VCIssuanceService.requestVCIssuance: failed", error);
      return this.markIssuanceStatus(ctx, vcIssuanceRequest.id, error);
    }
  }

  private async getUserDid(userId: string, ctx: IContext): Promise<string | null> {
    const didRequest = await this.didIssuanceRequestRepository.findLatestCompletedByUserId(
      ctx,
      userId,
    );
    return didRequest?.didValue ?? null;
  }

  evaluateTokenValidity(identity: { authToken: string | null; tokenExpiresAt: Date | null }): {
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
        `VCIssuanceService.refreshAuthToken failed for uid ${uid} (non-blocking):`,
        error,
      );
      return null;
    }
  }

  private async markIssuanceStatus(
    ctx: IContext,
    requestId: string,
    error: unknown,
    status: VcIssuanceStatus = VcIssuanceStatus.FAILED,
  ): Promise<{ success: boolean; requestId: string }> {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (status === VcIssuanceStatus.PENDING) {
      logger.warn(`Issuance ${requestId} marked as PENDING. Cause: ${errorMessage}`);
    }

    await this.vcIssuanceRequestRepository.update(ctx, requestId, {
      status,
      processedAt: new Date(),
      ...(status === VcIssuanceStatus.FAILED && {
        errorMessage,
        retryCount: { increment: 1 },
      }),
    });

    return { success: false, requestId };
  }

  async syncJobStatus(
    request: VcIssuanceRequestWithUser,
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
        logger.warn(`Token refresh failed for ${phoneIdentity.uid}, marking for retry`);
        await this.vcIssuanceRequestRepository.update(ctx, request.id, {
          retryCount: { increment: 1 },
          errorMessage: "Token refresh failed",
        });
        return { success: false, status: "failed" };
      }
    }

    if (!token || !isValid) {
      const reason = !phoneIdentity.refreshToken
        ? "no refresh token available"
        : "token invalid and refresh failed";
      logger.warn(`❌ No valid token for user ${request.userId}: ${reason}`);
      return { success: false, status: "skipped" };
    }

    // 外部API呼び出し
    try {
      const jobStatus = await this.client.call<{
        status: string;
        result?: { recordId: string };
      }>(phoneIdentity.uid, token, `/vc/connectionless/job/${request.jobId}`, "GET");

      if (!jobStatus) {
        logger.warn(`External API returned null for job ${request.jobId}`);
        await this.vcIssuanceRequestRepository.update(ctx, request.id, {
          errorMessage: "External API call failed during sync",
          retryCount: { increment: 1 },
        });
        return { success: false, status: "retrying" };
      }

      if (jobStatus.status === "completed" && jobStatus.result?.recordId) {
        await this.vcIssuanceRequestRepository.update(ctx, request.id, {
          status: VcIssuanceStatus.COMPLETED,
          vcRecordId: jobStatus.result.recordId,
          completedAt: new Date(),
        });
        logger.info(`✅ VC completed: ${request.id}`);
        return { success: true, status: "completed" };
      }

      if (jobStatus.status === "failed") {
        await this.vcIssuanceRequestRepository.update(ctx, request.id, {
          status: VcIssuanceStatus.FAILED,
          errorMessage: "VC issuance failed on server",
        });
        logger.error(`❌ VC failed: ${request.id}`);
        return { success: false, status: "failed" };
      }

      // Still processing
      await this.vcIssuanceRequestRepository.update(ctx, request.id, {
        retryCount: { increment: 1 },
      });
      return { success: true, status: "retrying" };
    } catch (error) {
      // エラー分類
      const classified = classifyError(error, !!token);

      // 詳細ログ（400系エラーの場合はリクエスト詳細も含める）
      if (classified.requestDetails) {
        logger.error(`💥 Error in VC request ${request.id} with request details:`, {
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
        logger.error(`💥 Error in VC request ${request.id}:`, {
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
          : `${classified.category} (HTTP ${classified.httpStatus}): ${classified.message}`;

        await this.vcIssuanceRequestRepository.update(ctx, request.id, {
          status: VcIssuanceStatus.FAILED,
          errorMessage,
          retryCount: PERMANENTLY_FAILED_RETRY_COUNT,
        });
        return { success: false, status: "failed" };
      }

      // リトライ可能なエラー
      const newRetryCount = request.retryCount + 1;

      if (newRetryCount >= classified.maxRetries) {
        // リトライ回数超過 → FAILED
        await this.vcIssuanceRequestRepository.update(ctx, request.id, {
          status: VcIssuanceStatus.FAILED,
          errorMessage: `${classified.category} (HTTP ${classified.httpStatus || "unknown"}): ${classified.message} (max retries exceeded)`,
          retryCount: newRetryCount,
        });
        return { success: false, status: "failed" };
      }

      // まだリトライ可能
      await this.vcIssuanceRequestRepository.update(ctx, request.id, {
        retryCount: { increment: 1 },
        errorMessage: `${classified.category} (HTTP ${classified.httpStatus || "unknown"}): ${classified.message}`,
      });
      return { success: false, status: "retrying" };
    }
  }
}
