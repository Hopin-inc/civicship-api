import { IContext } from "@/types/server";
import {
  GqlCurrentUserPayload,
  GqlMutationUserSignUpArgs,
  GqlUserDeletePayload,
  GqlLinkPhoneAuthPayload,
  GqlStorePhoneAuthTokenPayload,
  GqlImageInput,
} from "@/types/graphql";
import IdentityConverter from "@/application/domain/account/identity/data/converter";
import IdentityService from "@/application/domain/account/identity/service";
import IdentityPresenter from "@/application/domain/account/identity/presenter";
import MembershipService from "@/application/domain/account/membership/service";
import WalletService from "@/application/domain/account/wallet/service";
import ImageService from "@/application/domain/content/image/service";
import { injectable, inject } from "tsyringe";
import { GqlIdentityPlatform as IdentityPlatform } from "@/types/graphql";
import logger from "@/infrastructure/logging";
import { PrismaUserDetail } from "@/application/domain/account/user/data/type";
import { Prisma, User } from "@prisma/client";
import { DIDIssuanceService } from "@/application/domain/account/identity/didIssuanceRequest/service";

@injectable()
export default class IdentityUseCase {
  constructor(
    @inject("IdentityService") private readonly identityService: IdentityService,
    @inject("MembershipService") private readonly membershipService: MembershipService,
    @inject("WalletService") private readonly walletService: WalletService,
    @inject("ImageService") private readonly imageService: ImageService,
    @inject("DIDIssuanceService") private readonly didIssuanceService: DIDIssuanceService,
  ) {}

  async userViewCurrentAccount(context: IContext): Promise<GqlCurrentUserPayload> {
    return {
      user: context.currentUser,
    };
  }

  async linkPhoneAuth(
    ctx: IContext,
    phoneUid: string,
    userId: string,
  ): Promise<GqlLinkPhoneAuthPayload> {
    if (!ctx.uid || !ctx.platform || ctx.platform !== IdentityPlatform.Line) {
      throw new Error("LINE authentication required");
    }

    const user = await ctx.issuer.public(ctx, async (tx) => {
      return this.identityService.linkPhoneIdentity(ctx, userId, phoneUid, tx);
    });

    return {
      success: true,
      user: user,
    };
  }

  async userDeleteAccount(context: IContext): Promise<GqlUserDeletePayload> {
    if (!context.uid || !context.platform || !context.tenantId) {
      throw new Error("Authentication required (uid or platform missing)");
    }
    const uid = context.uid;
    const user = await this.identityService.deleteUserAndIdentity(uid);
    await this.identityService.deleteFirebaseAuthUser(uid, context.tenantId);
    return IdentityPresenter.delete(user);
  }

  async storePhoneAuthToken(
    ctx: IContext,
    phoneUid: string,
    authToken: string,
    refreshToken: string,
    expiresIn: number,
  ): Promise<GqlStorePhoneAuthTokenPayload> {
    if (!ctx.uid || !ctx.platform) {
      throw new Error("Authentication required");
    }

    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + expiresIn);

    try {
      await this.identityService.storeAuthTokens(phoneUid, authToken, refreshToken, expiryTime);

      return {
        success: true,
        expiresAt: expiryTime,
      };
    } catch (error) {
      logger.error("Failed to store auth tokens:", error);
      return {
        success: false,
        expiresAt: null,
      };
    }
  }

  async userCreateAccount(
    ctx: IContext,
    args: GqlMutationUserSignUpArgs,
  ): Promise<GqlCurrentUserPayload> {
    this.validateSignupContext(ctx);
    const { data, image, phoneUid, phoneRefreshToken, lineRefreshToken } =
      this.extractSignupInput(args);

    const user = await this.createUserWithImage(data, ctx, image, phoneUid);
    const res = await this.initializeUserAssets(ctx, user.id, args.input.communityId);

    if (!res) {
      logger.error("[userCreateAccount] User not found after asset initialization");
      throw new Error("User not found after initialization");
    }

    await this.storeUserAuthTokens(ctx, phoneUid, phoneRefreshToken, lineRefreshToken);

    if (phoneUid) {
      await this.didIssuanceService.requestDIDIssuance(user.id, phoneUid, ctx);
    }
    return IdentityPresenter.create(res);
  }

  private validateSignupContext(ctx: IContext): void {
    if (!ctx.uid || !ctx.platform) {
      throw new Error("Authentication required (uid or platform missing)");
    }
    if (!ctx.phoneAuthToken) {
      throw new Error("Phone authentication required for user signup");
    }
  }

  private extractSignupInput(args: GqlMutationUserSignUpArgs) {
    const { data, image, phoneUid, phoneRefreshToken, lineRefreshToken } =
      IdentityConverter.create(args);
    return { data, image, phoneUid, phoneRefreshToken, lineRefreshToken };
  }

  private async createUserWithImage(
    data: Prisma.UserCreateInput,
    ctx: IContext,
    image?: GqlImageInput,
    phoneUid?: string,
  ): Promise<PrismaUserDetail> {
    const uploadedImage = image
      ? await this.imageService.uploadPublicImage(image, "users")
      : undefined;

    return this.identityService.createUserAndIdentity(
      {
        ...data,
        image: uploadedImage ? { create: uploadedImage } : undefined,
      },
      ctx.uid!,
      ctx.platform!,
      phoneUid,
    );
  }

  private async initializeUserAssets(
    ctx: IContext,
    userId: string,
    communityId: string,
  ): Promise<User | null> {
    try {
      await ctx.issuer.public(ctx, async (tx) => {
        await this.membershipService.joinIfNeeded(ctx, userId, communityId, tx);
        await this.walletService.createMemberWalletIfNeeded(ctx, userId, communityId, tx);
      });

      if (!ctx.uid) {
        logger.error("uidが見つかりません");
        return null;
      }
      const user = await this.identityService.findUserByIdentity(ctx, ctx.uid);
      if (!user) {
        logger.error(`[initializeUserAssets] ユーザーが見つかりません: userId=${userId}`);
      }

      return user;
    } catch (error) {
      logger.error("[initializeUserAssets] ユーザー資産の初期化中にエラーが発生しました", {
        userId,
        communityId,
        error,
      });
      throw error;
    }
  }

  private async storeUserAuthTokens(
    ctx: IContext,
    phoneUid?: string,
    phoneRefreshToken?: string,
    lineRefreshToken?: string,
  ): Promise<void> {
    if (phoneUid && ctx.phoneAuthToken) {
      const expiryTime = this.deriveExpiryTime(ctx.phoneTokenExpiresAt);
      const refreshToken = phoneRefreshToken || ctx.phoneRefreshToken || "";
      await this.identityService.storeAuthTokens(
        phoneUid,
        ctx.phoneAuthToken,
        refreshToken,
        expiryTime,
      );
      console.log(`Stored phone auth tokens for ${phoneUid}`);
    }

    if (ctx.uid && ctx.idToken && ctx.platform === IdentityPlatform.Line) {
      const expiryTime = this.deriveExpiryTime(ctx.tokenExpiresAt);
      const refreshToken = lineRefreshToken || ctx.refreshToken || "";
      await this.identityService.storeAuthTokens(ctx.uid, ctx.idToken, refreshToken, expiryTime);
      console.log(`Stored LINE auth tokens for ${ctx.uid}`);
    }
  }

  private deriveExpiryTime(raw?: string): Date {
    return raw ? new Date(parseInt(raw, 10)) : new Date(Date.now() + 60 * 60 * 1000);
  }
}
