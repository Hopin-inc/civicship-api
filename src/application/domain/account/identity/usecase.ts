import { IContext } from "@/types/server";
import {
  GqlCurrentUserPayload,
  GqlMutationUserSignUpArgs,
  GqlUserDeletePayload,
  GqlLinkPhoneAuthPayload,
  GqlStorePhoneAuthTokenPayload,
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

@injectable()
export default class IdentityUseCase {
  constructor(
    @inject("IdentityService") private readonly identityService: IdentityService,
    @inject("MembershipService") private readonly membershipService: MembershipService,
    @inject("WalletService") private readonly walletService: WalletService,
    @inject("ImageService") private readonly imageService: ImageService,
  ) {}

  async userViewCurrentAccount(context: IContext): Promise<GqlCurrentUserPayload> {
    return {
      user: context.currentUser,
    };
  }

  async userCreateAccount(
    ctx: IContext,
    args: GqlMutationUserSignUpArgs,
  ): Promise<GqlCurrentUserPayload> {
    if (!ctx.uid || !ctx.platform) {
      throw new Error("Authentication required (uid or platform missing)");
    }

    if (!ctx.phoneAuthToken) {
      throw new Error("Phone authentication required for user signup");
    }

    const { data, image, phoneUid } = IdentityConverter.create(args);

    const uploadedImage = image
      ? await this.imageService.uploadPublicImage(image, "users")
      : undefined;

    const user = await this.identityService.createUserAndIdentity(
      {
        ...data,
        image: uploadedImage ? { create: uploadedImage } : undefined,
      },
      ctx.uid,
      ctx.platform,
      phoneUid,
    );

    const res = await ctx.issuer.public(ctx, async (tx) => {
      await this.membershipService.joinIfNeeded(ctx, user.id, args.input.communityId, tx);
      await this.walletService.createMemberWalletIfNeeded(ctx, user.id, args.input.communityId, tx);
      return user;
    });

    if (phoneUid && ctx.phoneAuthToken) {
      try {
        const expiryTime = ctx.phoneTokenExpiresAt
          ? new Date(parseInt(ctx.phoneTokenExpiresAt, 10))
          : new Date(Date.now() + 60 * 60 * 1000); // Default 1 hour expiry

        const refreshToken = IdentityConverter.create(args).phoneRefreshToken || ctx.phoneRefreshToken || "";

        await this.identityService.storeAuthTokens(
          phoneUid,
          ctx.phoneAuthToken,
          refreshToken,
          expiryTime
        );

        try {
          await this.identityService.requestDIDIssuance(res.id, phoneUid, ctx);
          logger.debug(`Requested DID issuance for user ${res.id} with phoneUid ${phoneUid}`);
        } catch (didError) {
          logger.error("Failed to request DID issuance during user signup:", didError);
        }

        logger.debug(`Stored phone auth tokens during user signup for ${phoneUid}, expires at ${expiryTime.toISOString()}`);
      } catch (error) {
        logger.error("Failed to store phone auth tokens during user signup:", error);
      }
    }

    if (ctx.uid && ctx.idToken && ctx.platform === IdentityPlatform.Line) {
      try {
        const expiryTime = ctx.tokenExpiresAt
          ? new Date(parseInt(ctx.tokenExpiresAt, 10))
          : new Date(Date.now() + 60 * 60 * 1000); // Default 1 hour expiry

        const refreshToken = IdentityConverter.create(args).lineRefreshToken || ctx.refreshToken || "";

        await this.identityService.storeAuthTokens(
          ctx.uid,
          ctx.idToken,
          refreshToken,
          expiryTime
        );

        logger.debug(`Stored LINE auth tokens during user signup for ${ctx.uid}, expires at ${expiryTime.toISOString()}`);
      } catch (error) {
        logger.error("Failed to store LINE auth tokens during user signup:", error);
      }
    }

    return IdentityPresenter.create(res);
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
    expiresIn: number
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
}
