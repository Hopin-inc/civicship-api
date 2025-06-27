import { LIFFService, LINEProfile } from "./service";
import CommunityConfigService from "@/application/domain/account/community/config/service";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";

export interface LIFFLoginRequest {
  accessToken: string;
  communityId: string;
}

export interface LIFFLoginResponse {
  customToken: string;
  profile: LINEProfile;
}

export class LIFFAuthUseCase {
  static async login(request: LIFFLoginRequest): Promise<LIFFLoginResponse> {
    const configService = container.resolve(CommunityConfigService);
    const issuer = new PrismaClientIssuer();

    const { liffId } = await configService.getLiffConfig(
      { issuer } as IContext,
      request.communityId,
    );

    await LIFFService.verifyAccessToken(request.accessToken, liffId);
    const profile = await LIFFService.getProfile(request.accessToken);

    const tenantId = await configService.getFirebaseTenantId(
      { issuer } as IContext,
      request.communityId,
    );

    const customToken = await LIFFService.createFirebaseCustomToken(profile, tenantId);

    return {
      customToken,
      profile,
    };
  }
}
