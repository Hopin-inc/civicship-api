import { IContext } from "@/types/server";
import {
  GqlCurrentUserPayload,
  GqlMutationUserSignUpArgs,
  GqlUserDeletePayload,
  GqlLinkPhoneAuthPayload,
  GqlStorePhoneAuthTokenPayload,
  GqlMutationIdentityCheckPhoneUserArgs,
  GqlIdentityCheckPhoneUserPayload,
  GqlPhoneUserStatus,
  GqlUserSignUpInput,
} from "@/types/graphql";
import IdentityService from "@/application/domain/account/identity/service";
import IdentityPresenter from "@/application/domain/account/identity/presenter";
import MembershipService from "@/application/domain/account/membership/service";
import WalletService from "@/application/domain/account/wallet/service";
import ImageService from "@/application/domain/content/image/service";
import { injectable, inject } from "tsyringe";
import { GqlIdentityPlatform as IdentityPlatform } from "@/types/graphql";
import logger from "@/infrastructure/logging";
import { AuthenticationError } from "@/errors/graphql";
import { IdentityPlatform as PrismaIdentityPlatform } from "@prisma/client";

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
    { input }: GqlMutationUserSignUpArgs,
  ): Promise<GqlCurrentUserPayload> {
    if (!ctx.uid || !ctx.platform) throw new Error("Authentication required");
    if (!input.phoneAccessToken) throw new Error("Phone authentication required");

    const uploadedImage = input.image
      ? await this.imageService.uploadPublicImage(input.image, "users")
      : undefined;

    const identities: Array<{
      uid: string;
      platform: PrismaIdentityPlatform;
      communityId: string;
      authToken?: string;
      refreshToken?: string;
      tokenExpiresAt?: Date;
    }> = [];

    const lineExpiryTime = this.deriveExpiryTime(input.lineTokenExpiresAt);
    identities.push({
      uid: ctx.uid,
      platform: ctx.platform as PrismaIdentityPlatform,
      communityId: ctx.communityId,
      authToken: ctx.idToken,
      refreshToken: input.lineRefreshToken || "",
      tokenExpiresAt: lineExpiryTime,
    });

    if (input.phoneUid) {
      const phoneExpiryTime = this.deriveExpiryTime(input.phoneTokenExpiresAt);
      identities.push({
        uid: input.phoneUid,
        platform: PrismaIdentityPlatform.PHONE,
        communityId: ctx.communityId,
        authToken: input.phoneAccessToken,
        refreshToken: input.phoneRefreshToken || "",
        tokenExpiresAt: phoneExpiryTime,
      });
    }

    await ctx.issuer.public(ctx, async (tx) => {
      const userData = {
        name: input.name,
        currentPrefecture: input.currentPrefecture,
        slug: input.slug || "",
        phoneNumber: input.phoneNumber,
        image: uploadedImage ? { create: uploadedImage } : undefined,
      };

      const user = await this.identityService.createUserWithIdentities(
        ctx,
        userData,
        identities,
        tx,
      );

      await this.membershipService.joinIfNeeded(ctx, user.id, ctx.communityId, tx);
      await this.walletService.createMemberWalletIfNeeded(ctx, user.id, ctx.communityId, tx);

      return user;
    });

    await this.storeUserAuthTokens(ctx, input);

    const user = await this.identityService.findUserByIdentity(ctx, ctx.uid);
    if (!user) {
      logger.error("[userCreateAccount] User not found after creation");
      throw new Error("User not found after creation");
    }

    return IdentityPresenter.create(user);
  }

  private async storeUserAuthTokens(
    ctx: IContext,
    {
      phoneRefreshToken,
      phoneTokenExpiresAt,
      phoneUid,
      lineTokenExpiresAt,
      lineRefreshToken,
      phoneAccessToken,
    }: GqlUserSignUpInput,
  ): Promise<void> {
    if (phoneUid && phoneAccessToken) {
      const expiryTime = this.deriveExpiryTime(phoneTokenExpiresAt);
      const refreshToken = phoneRefreshToken || "";
      await this.identityService.storeAuthTokens(
        phoneUid,
        phoneAccessToken,
        refreshToken,
        expiryTime,
      );
      logger.debug(`Stored phone auth tokens for ${phoneUid}`);
    }

    if (ctx.uid && ctx.idToken && ctx.platform === IdentityPlatform.Line) {
      const expiryTime = this.deriveExpiryTime(lineTokenExpiresAt);
      const refreshToken = lineRefreshToken || "";
      await this.identityService.storeAuthTokens(ctx.uid, ctx.idToken, refreshToken, expiryTime);
      logger.debug(`Stored LINE auth tokens for ${ctx.uid}`);
    }
  }

  private deriveExpiryTime(raw?: string): Date {
    return raw ? new Date(parseInt(raw, 10)) : new Date(Date.now() + 60 * 60 * 1000);
  }

  async checkPhoneUser(
    ctx: IContext,
    args: GqlMutationIdentityCheckPhoneUserArgs,
  ): Promise<GqlIdentityCheckPhoneUserPayload> {
    const { phoneUid } = args.input;

    const existingUser = await this.identityService.findUserByIdentity(ctx, phoneUid);

    if (!existingUser) {
      return {
        status: GqlPhoneUserStatus.NewUser,
        user: null,
        membership: null,
      };
    }

    const existingMembership = await this.membershipService.findMembership(
      ctx,
      existingUser.id,
      ctx.communityId,
    );

    if (existingMembership) {
      return {
        status: GqlPhoneUserStatus.ExistingSameCommunity,
        user: existingUser,
        membership: existingMembership,
      };
    }

    const membership = await ctx.issuer.public(ctx, async (tx) => {
      if (!ctx.uid || !ctx.platform) {
        throw new AuthenticationError();
      }

      const existingIdentity = await this.identityService.findUserByIdentity(ctx, ctx.uid);

      if (existingIdentity) {
        if (existingIdentity.id !== existingUser.id) {
          logger.error("Identity already linked to another user", {
            uid: ctx.uid,
            platform: ctx.platform,
            existingUserId: existingIdentity.id,
            attemptedUserId: existingUser.id,
            communityId: ctx.communityId,
          });
          throw new Error("This LINE account is already linked to another user");
        }
        logger.info("Identity already exists for this user, skipping creation", {
          uid: ctx.uid,
          platform: ctx.platform,
          userId: existingUser.id,
          communityId: ctx.communityId,
        });
      } else {
        await this.identityService.addIdentityToUser(
          ctx,
          existingUser.id,
          ctx.uid,
          ctx.platform,
          ctx.communityId,
          tx,
        );
        logger.debug("Created new identity for user", {
          uid: ctx.uid,
          platform: ctx.platform,
          userId: existingUser.id,
          communityId: ctx.communityId,
        });
      }

      const membership = await this.membershipService.joinIfNeeded(
        ctx,
        existingUser.id,
        ctx.communityId,
        tx,
      );
      await this.walletService.createMemberWalletIfNeeded(
        ctx,
        existingUser.id,
        ctx.communityId,
        tx,
      );
      return membership;
    });

    return {
      status: GqlPhoneUserStatus.ExistingDifferentCommunity,
      user: existingUser,
      membership: membership,
    };
  }
}
