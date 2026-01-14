import CommunityConfigService from "@/application/domain/account/community/config/service";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";
import { LIFFService, LINEProfile } from "@/application/domain/account/auth/liff/service";
import IdentityService from "@/application/domain/account/identity/service";
import UserService from "@/application/domain/account/user/service";
import { IdentityPlatform } from "@prisma/client";

export interface LIFFLoginRequest {
  accessToken: string;
  communityId: string | null;
}

export interface LIFFLoginResponse {
  customToken: string;
  profile: LINEProfile;
  expiryTimestamp: number;
}

export interface GlobalLIFFLoginResponse {
  status: "success" | "user_not_found" | "registration_required";
  customToken?: string;
  profile: LINEProfile;
  expiryTimestamp?: number;
}

export interface PhoneLinkRequest {
  accessToken: string;
  phoneNumber: string;
}

export interface PhoneLinkResponse {
  status: "linked" | "registration_required";
  customToken?: string;
  expiryTimestamp?: number;
  userId?: string;
}

export interface UserRegistrationRequest {
  accessToken: string;
  name: string;
  slug: string;
  phoneNumber: string;
  currentPrefecture: import("@prisma/client").CurrentPrefecture;
}

export interface UserRegistrationResponse {
  customToken: string;
  expiryTimestamp: number;
  userId: string;
}

export class LIFFAuthUseCase {
  static async login(request: LIFFLoginRequest): Promise<LIFFLoginResponse> {
    const configService = container.resolve(CommunityConfigService);
    const issuer = new PrismaClientIssuer();

    const ctx = { issuer } as IContext;

    const { liffId } = await configService.getLiffConfig(ctx, request.communityId);
    const verifyResult = await LIFFService.verifyAccessToken(request.accessToken, liffId);

    const profile = await LIFFService.getProfile(request.accessToken);

    const tenantId = await configService.getFirebaseTenantId(ctx, request.communityId);
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

  static async loginWithGlobalLiff(accessToken: string): Promise<GlobalLIFFLoginResponse> {
    const configService = container.resolve(CommunityConfigService);
    const identityService = container.resolve(IdentityService);
    const issuer = new PrismaClientIssuer();

    const ctx = { issuer } as IContext;

    const { liffId } = await configService.getLiffConfig(ctx, null);
    const verifyResult = await LIFFService.verifyAccessToken(accessToken, liffId);

    const profile = await LIFFService.getProfile(accessToken);

    const globalIdentity = await identityService.findGlobalIdentity(
      profile.userId,
      IdentityPlatform.LINE,
    );

    if (!globalIdentity) {
      return {
        status: "user_not_found",
        profile,
      };
    }

    const tenantId = await configService.getFirebaseTenantId(ctx, null);
    const customToken = await LIFFService.createFirebaseCustomToken(profile, tenantId);

    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + verifyResult.expires_in);
    const expiryTimestamp = Math.floor(expiryTime.getTime() / 1000);

    return {
      status: "success",
      customToken,
      profile,
      expiryTimestamp,
    };
  }

  static async linkPhoneAndGetUser(request: PhoneLinkRequest): Promise<PhoneLinkResponse> {
    const configService = container.resolve(CommunityConfigService);
    const identityService = container.resolve(IdentityService);
    const userService = container.resolve(UserService);
    const issuer = new PrismaClientIssuer();

    const ctx = { issuer } as IContext;

    const { liffId } = await configService.getLiffConfig(ctx, null);
    await LIFFService.verifyAccessToken(request.accessToken, liffId);

    const profile = await LIFFService.getProfile(request.accessToken);

    const existingUser = await userService.findUserByPhoneNumber(request.phoneNumber);

    if (!existingUser) {
      return {
        status: "registration_required",
      };
    }

    await identityService.addIdentityToUser(
      ctx,
      existingUser.id,
      profile.userId,
      IdentityPlatform.LINE,
      null,
    );

    const tenantId = await configService.getFirebaseTenantId(ctx, null);
    const customToken = await LIFFService.createFirebaseCustomToken(profile, tenantId);

    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + 3600);
    const expiryTimestamp = Math.floor(expiryTime.getTime() / 1000);

    return {
      status: "linked",
      customToken,
      expiryTimestamp,
      userId: existingUser.id,
    };
  }

  static async registerNewUser(request: UserRegistrationRequest): Promise<UserRegistrationResponse> {
    const configService = container.resolve(CommunityConfigService);
    const identityService = container.resolve(IdentityService);
    const issuer = new PrismaClientIssuer();

    const ctx = { issuer } as IContext;

    const { liffId } = await configService.getLiffConfig(ctx, null);
    await LIFFService.verifyAccessToken(request.accessToken, liffId);

    const profile = await LIFFService.getProfile(request.accessToken);

    const newUser = await identityService.createUserAndIdentity({
      name: request.name,
      slug: request.slug,
      phoneNumber: request.phoneNumber,
      currentPrefecture: request.currentPrefecture,
      identities: {
        create: {
          uid: profile.userId,
          platform: IdentityPlatform.LINE,
        },
      },
    });

    const tenantId = await configService.getFirebaseTenantId(ctx, null);
    const customToken = await LIFFService.createFirebaseCustomToken(profile, tenantId);

    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + 3600);
    const expiryTimestamp = Math.floor(expiryTime.getTime() / 1000);

    return {
      customToken,
      expiryTimestamp,
      userId: newUser.id,
    };
  }
}
