import { injectable, inject } from "tsyringe";
import { VcIssuanceStatus } from "@prisma/client";
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

  async requestVCIssuance(
    evaluationId: string,
    userId: string,
    phoneUid: string,
    vcRequest: EvaluationCredentialPayload,
    ctx: IContext,
  ): Promise<{ success: boolean; requestId: string; jobId?: string }> {
    const userDid = await this.getUserDid(userId, ctx);
    if (!userDid) {
      throw new Error("User DID not found. DID must be issued before VC issuance.");
    }

    const vcIssuanceRequest = await this.vcIssuanceRequestRepository.create(ctx, {
      evaluationId,
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
          claims: vcRequest.claims,
          credentialFormat: vcRequest.credentialFormat || "JWT",
          schemaId: vcRequest.schemaId,
        },
      );

      if (response?.jobId) {
        await this.vcIssuanceRequestRepository.update(ctx, vcIssuanceRequest.id, {
          status: VcIssuanceStatus.PROCESSING,
          jobId: response.jobId,
        });

        return { success: true, requestId: vcIssuanceRequest.id, jobId: response.jobId };
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
      logger.error(`VCIssuanceService.refreshAuthToken failed for uid ${uid}:`, error);
      throw error;
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
