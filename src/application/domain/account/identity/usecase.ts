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
import { AuthenticationError } from "@/errors/graphql";
import { PrismaUserDetail } from "@/application/domain/account/user/data/type";
import { Prisma, User } from "@prisma/client";

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
    args: GqlMutationUserSignUpArgs,
  ): Promise<GqlCurrentUserPayload> {
    try {
      this.validateSignupContext(ctx);
      const { data, image, phoneUid, phoneRefreshToken, lineRefreshToken } =
        this.extractSignupInput(args);

      logger.info("Starting user account creation", {
        phoneUid,
        communityId: args.input.communityId,
        hasImage: !!image,
        hasPhoneRefreshToken: !!phoneRefreshToken,
        hasLineRefreshToken: !!lineRefreshToken,
        component: "IdentityUseCase",
        operation: "userCreateAccount",
      });

      const user = await this.createUserWithImage(data, ctx, image, phoneUid);
      const res = await this.initializeUserAssets(ctx, user.id, args.input.communityId);

      if (!res) {
        logger.error("User not found after asset initialization", {
          userId: user.id,
          phoneUid,
          communityId: args.input.communityId,
          component: "IdentityUseCase",
          operation: "userCreateAccount",
          errorCategory: "asset_initialization_failed",
        });
        throw new Error("User not found after initialization");
      }

      await this.storeUserAuthTokens(ctx, phoneUid, phoneRefreshToken, lineRefreshToken);
      
      logger.info("User account created successfully", {
        userId: res.id,
        phoneUid,
        communityId: args.input.communityId,
        component: "IdentityUseCase",
        operation: "userCreateAccount",
      });
      
      return IdentityPresenter.create(res);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorContext = {
        error: errorMessage,
        phoneUid: args.input.phoneUid,
        communityId: args.input.communityId,
        hasPhoneAuthToken: !!ctx.phoneAuthToken,
        hasPhoneUid: !!ctx.phoneUid,
        hasUid: !!ctx.uid,
        hasPlatform: !!ctx.platform,
        component: "IdentityUseCase",
        operation: "userCreateAccount",
      };

      if (errorMessage.includes("Authentication") || errorMessage.includes("required")) {
        logger.error("User account creation authentication error", {
          ...errorContext,
          errorCategory: "authentication_error",
        });
      } else if (errorMessage.includes("validation") || errorMessage.includes("invalid")) {
        logger.error("User account creation validation error", {
          ...errorContext,
          errorCategory: "validation_error",
        });
      } else {
        logger.error("User account creation system error", {
          ...errorContext,
          errorCategory: "system_error",
        });
      }
      
      throw error;
    }
  }

  private validateSignupContext(ctx: IContext): void {
    if (!ctx.uid || !ctx.platform) {
      logger.error("Authentication required (uid or platform missing)");
      throw new Error("Authentication required (uid or platform missing)");
    }
    if (!ctx.phoneAuthToken) {
      logger.error("Phone authentication required for user signup");
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
      ctx.communityId,
      phoneUid,
    );
  }

  private async initializeUserAssets(
    ctx: IContext,
    userId: string,
    communityId: string,
  ): Promise<User | null> {
    try {
      logger.debug("Initializing user assets", {
        userId,
        communityId,
        hasUid: !!ctx.uid,
        component: "IdentityUseCase",
        operation: "initializeUserAssets",
      });

      await ctx.issuer.public(ctx, async (tx) => {
        await this.membershipService.joinIfNeeded(ctx, userId, communityId, tx);
        await this.walletService.createMemberWalletIfNeeded(ctx, userId, communityId, tx);
      });

      if (!ctx.uid) {
        logger.error("Missing uid in context during asset initialization", {
          userId,
          communityId,
          component: "IdentityUseCase",
          operation: "initializeUserAssets",
          errorCategory: "missing_context",
        });
        return null;
      }
      
      const user = await this.identityService.findUserByIdentity(ctx, ctx.uid);
      if (!user) {
        logger.error("User not found after asset initialization", {
          userId,
          communityId,
          uid: ctx.uid,
          component: "IdentityUseCase",
          operation: "initializeUserAssets",
          errorCategory: "user_not_found",
        });
      } else {
        logger.debug("User assets initialized successfully", {
          userId,
          communityId,
          uid: ctx.uid,
          component: "IdentityUseCase",
          operation: "initializeUserAssets",
        });
      }

      return user;
    } catch (error) {
      logger.error("Failed to initialize user assets", {
        userId,
        communityId,
        uid: ctx.uid,
        error: error instanceof Error ? error.message : String(error),
        component: "IdentityUseCase",
        operation: "initializeUserAssets",
        errorCategory: "system_error",
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
      logger.debug(`Stored phone auth tokens for ${phoneUid}`);
    }

    if (ctx.uid && ctx.idToken && ctx.platform === IdentityPlatform.Line) {
      const expiryTime = this.deriveExpiryTime(ctx.tokenExpiresAt);
      const refreshToken = lineRefreshToken || ctx.refreshToken || "";
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
    if (!ctx.phoneUid) {
      throw new Error("Phone authentication required");
    }

    const { communityId } = args.input;

    const existingUser = await this.identityService.findUserByIdentity(ctx, ctx.phoneUid);

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
      communityId,
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
      await this.identityService.addIdentityToUser(
        ctx,
        existingUser.id,
        ctx.uid,
        ctx.platform,
        ctx.communityId,
      );
      const membership = await this.membershipService.joinIfNeeded(
        ctx,
        existingUser.id,
        communityId,
        tx,
      );
      await this.walletService.createMemberWalletIfNeeded(ctx, existingUser.id, communityId, tx);
      return membership;
    });

    return {
      status: GqlPhoneUserStatus.ExistingDifferentCommunity,
      user: existingUser,
      membership: membership,
    };
  }
}
