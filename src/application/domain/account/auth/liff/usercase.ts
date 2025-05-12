import { LIFFService, LINEProfile } from './service';

export interface LIFFLoginRequest {
  accessToken: string;
}

export interface LIFFLoginResponse {
  customToken: string;
  profile: LINEProfile;
}

export class LIFFAuthUseCase {
  static async login(request: LIFFLoginRequest): Promise<LIFFLoginResponse> {
    await LIFFService.verifyAccessToken(request.accessToken);
    const profile = await LIFFService.getProfile(request.accessToken);

    const tenantId = process.env.FIREBASE_AUTH_TENANT_ID;
    if (!tenantId) {
      throw new Error("FIREBASE_AUTH_TENANT_ID not defined.")
    }
    const customToken = await LIFFService.createFirebaseCustomToken(profile, tenantId);

    return {
      customToken,
      profile,
    };
  }
}
