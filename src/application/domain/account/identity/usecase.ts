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
import { AuthenticationError, ValidationError } from "@/errors/graphql";
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

      const user = await this.createUserWithImage(data, ctx, image, phoneUid);
      const res = await this.initializeUserAssets(ctx, user.id, args.input.communityId);

      if (!res) {
        logger.error("[userCreateAccount] User not found after asset initialization");
        throw new Error("User not found after initialization");
      }

      await this.storeUserAuthTokens(ctx, phoneUid, phoneRefreshToken, lineRefreshToken);
      
      logger.info("User account created successfully", {
        userId: res.id,
        phoneUid,
        communityId: args.input.communityId
      });
      
      return IdentityPresenter.create(res);
    } catch (error) {
      logger.error("User account creation failed", {
        error: error instanceof Error ? error.message : String(error),
        phoneUid: args.input.phoneUid,
        communityId: args.input.communityId,
        hasPhoneAuthToken: !!ctx.phoneAuthToken,
        hasPhoneUid: !!ctx.phoneUid
      });
      throw error;
    }
  }

  private validateSignupContext(ctx: IContext): void {
    const errors: string[] = [];
    
    if (!ctx.uid || !ctx.platform) {
      errors.push("Authentication required (uid or platform missing)");
    }
    
    if (!ctx.phoneAuthToken) {
      errors.push("Phone authentication token required");
    }
    
    if (!ctx.phoneUid) {
      errors.push("Phone UID required");
    }
    
    if (errors.length > 0) {
      logger.error("User signup validation failed", {
        errors,
        hasUid: !!ctx.uid,
        hasPlatform: !!ctx.platform,
        hasPhoneAuthToken: !!ctx.phoneAuthToken,
        hasPhoneUid: !!ctx.phoneUid,
        operation: "userSignUp"
      });
      throw new AuthenticationError(`Validation failed: ${errors.join(", ")}`);
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
      await ctx.issuer.public(ctx, async (tx) => {
        await this.membershipService.joinIfNeeded(ctx, userId, communityId, tx);
        await this.walletService.createMemberWalletIfNeeded(ctx, userId, communityId, tx);
      });

      if (!ctx.uid) {
        logger.error("Missing uid in context");
        return null;
      }
      const user = await this.identityService.findUserByIdentity(ctx, ctx.uid);
      if (!user) {
        logger.error(`User not found after initialization: userId=${userId}`);
      }

      return user;
    } catch (error) {
      logger.error("Failed to initialize user assets", {
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
    if (phoneUid || ctx.phoneAuthToken) {
      if (!phoneUid) {
        logger.error("Phone UID missing for token storage", {
          hasPhoneAuthToken: !!ctx.phoneAuthToken,
          hasPhoneRefreshToken: !!phoneRefreshToken,
          operation: "userSignUp"
        });
        throw new ValidationError("Phone UID is required for token storage", ["phoneUid"]);
      }
      
      if (!ctx.phoneAuthToken) {
        logger.error("Phone auth token missing for storage", {
          phoneUid,
          hasPhoneRefreshToken: !!phoneRefreshToken,
          operation: "userSignUp"
        });
        throw new ValidationError("Phone auth token is required for token storage", ["phoneAuthToken"]);
      }

      const expiryTime = this.deriveExpiryTime(ctx.phoneTokenExpiresAt);
      const refreshToken = phoneRefreshToken || ctx.phoneRefreshToken || "";
      
      try {
        await this.identityService.storeAuthTokens(
          phoneUid,
          ctx.phoneAuthToken,
          refreshToken,
          expiryTime,
        );
        logger.info("Successfully stored phone auth tokens", {
          phoneUid,
          expiresAt: expiryTime.toISOString(),
          operation: "userSignUp"
        });
      } catch (error) {
        logger.error("Failed to store phone auth tokens", {
          phoneUid,
          error: error instanceof Error ? error.message : String(error),
          operation: "userSignUp"
        });
        throw error;
      }
    } else {
      logger.warn("No phone authentication data provided for token storage", {
        hasPhoneUid: !!phoneUid,
        hasPhoneAuthToken: !!ctx.phoneAuthToken,
        operation: "userSignUp"
      });
    }

    if (ctx.uid && ctx.idToken && ctx.platform === IdentityPlatform.Line) {
      const expiryTime = this.deriveExpiryTime(ctx.tokenExpiresAt);
      const refreshToken = lineRefreshToken || ctx.refreshToken || "";
      
      try {
        await this.identityService.storeAuthTokens(ctx.uid, ctx.idToken, refreshToken, expiryTime);
        logger.info("Successfully stored LINE auth tokens", {
          uid: ctx.uid,
          expiresAt: expiryTime.toISOString(),
          operation: "userSignUp"
        });
      } catch (error) {
        logger.error("Failed to store LINE auth tokens", {
          uid: ctx.uid,
          error: error instanceof Error ? error.message : String(error),
          operation: "userSignUp"
        });
        throw error;
      }
    }
  }

  private deriveExpiryTime(raw?: string): Date {
    if (raw) {
      try {
        const parsedTime = parseInt(raw, 10);
        if (!isNaN(parsedTime)) {
          return new Date(parsedTime * 1000);
        }
      } catch (error) {
        logger.debug("Could not parse token expiry time", {
          raw,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return new Date(Date.now() + 60 * 60 * 1000);
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
