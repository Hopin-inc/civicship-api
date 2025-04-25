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

    const customToken = await LIFFService.createFirebaseCustomToken(profile);
    
    return {
      customToken,
      profile,
    };
  }
}
