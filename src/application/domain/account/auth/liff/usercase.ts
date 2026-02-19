import CommunityConfigService from "@/application/domain/account/community/config/service";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";
import { LIFFService, LINEProfile } from "@/application/domain/account/auth/liff/service";

export interface LIFFLoginRequest {
  accessToken: string;
  communityId: string;
}

export interface LIFFLoginResponse {
  customToken: string;
  profile: LINEProfile;
  expiryTimestamp: number;
}

export class LIFFAuthUseCase {
  static async login(request: LIFFLoginRequest): Promise<LIFFLoginResponse> {
    const configService = container.resolve(CommunityConfigService);
    const issuer = new PrismaClientIssuer();

    const ctx = { issuer } as IContext;

    const { liffId } = await configService.getLiffConfig(ctx, request.communityId);
    const verifyResult = await LIFFService.verifyAccessToken(request.accessToken, liffId);

    const profile = await LIFFService.getProfile(request.accessToken);

    const tenantId = await configService.getFirebaseTenantId(issuer, request.communityId);
    const customToken = await LIFFService.createFirebaseCustomToken(profile, tenantId);

    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + verifyResult.expires_in);
    const expiryTimestamp = Math.floor(expiryTime.getTime() / 1000);

    return {
      customToken,
      profile,
      expiryTimestamp,
    };
  }
}
