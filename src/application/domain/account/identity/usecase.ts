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
import { User } from "@prisma/client";

@injectable()
export default class IdentityUseCase {
  constructor(
    @inject("IdentityService") private readonly identityService: IdentityService,
    @inject("MembershipService") private readonly membershipService: MembershipService,
    @inject("WalletService") private readonly walletService: WalletService,
    @inject("ImageService") private readonly imageService: ImageService,
  ) {}

  async userViewCurrentAccount(context: IContext): Promise<GqlCurrentUserPayload> {
    const flowId = (context as any).flowId || "no-flow-id";
    
    logger.info("📋 [currentUser] Query executed", {
      flowId,
      uid: context.uid?.slice(-6),
      tenantId: context.tenantId,
      communityId: context.communityId,
      platform: context.platform,
      hasCurrentUser: !!context.currentUser,
      userId: context.currentUser?.id?.slice(-6),
      membershipsCount: context.currentUser?.memberships?.length || 0,
    });

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

    const data = IdentityConverter.create(input, ctx.uid, ctx.platform, ctx.communityId);
    const uploadedImage = input.image
      ? await this.imageService.uploadPublicImage(input.image, "users")
      : undefined;

    const user = await this.identityService.createUserAndIdentity({
      ...data,
      image: uploadedImage ? { create: uploadedImage } : undefined,
    });

    const res = await this.initializeUserAssets(ctx, user.id, ctx.communityId);

    if (!res) {
      logger.error("[userCreateAccount] User not found after asset initialization");
      throw new Error("User not found after initialization");
    }

    await this.storeUserAuthTokens(ctx, input);
    return IdentityPresenter.create(res);
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

    logger.info("[checkPhoneUser] Starting phone user check", {
      phoneUid,
      communityId: ctx.communityId,
      uid: ctx.uid,
      platform: ctx.platform,
    });

    const existingUser = await this.identityService.findUserByIdentity(ctx, phoneUid);

    logger.info("[checkPhoneUser] User lookup result", {
      phoneUid,
      existingUserId: existingUser?.id,
      existingUserFound: !!existingUser,
      communityId: ctx.communityId,
    });

    if (!existingUser) {
      logger.info("[checkPhoneUser] Returning NEW_USER status", {
        phoneUid,
        communityId: ctx.communityId,
      });
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

    logger.info("[checkPhoneUser] Membership lookup result", {
      phoneUid,
      userId: existingUser.id,
      communityId: ctx.communityId,
      membershipFound: !!existingMembership,
      membershipUserId: existingMembership?.userId,
      membershipCommunityId: existingMembership?.communityId,
    });

    if (existingMembership) {
      logger.info("[checkPhoneUser] Returning EXISTING_SAME_COMMUNITY status", {
        phoneUid,
        userId: existingUser.id,
        communityId: ctx.communityId,
        membershipUserId: existingMembership.userId,
        membershipCommunityId: existingMembership.communityId,
      });
      return {
        status: GqlPhoneUserStatus.ExistingSameCommunity,
        user: existingUser,
        membership: existingMembership,
      };
    }

    logger.info("[checkPhoneUser] User exists but no membership in current community, proceeding with EXISTING_DIFFERENT_COMMUNITY flow", {
      phoneUid,
      userId: existingUser.id,
      communityId: ctx.communityId,
      currentUid: ctx.uid,
      currentPlatform: ctx.platform,
    });

    const membership = await ctx.issuer.public(ctx, async (tx) => {
      if (!ctx.uid || !ctx.platform) {
        logger.error("[checkPhoneUser] Missing uid or platform in context", {
          phoneUid,
          userId: existingUser.id,
          communityId: ctx.communityId,
          hasUid: !!ctx.uid,
          hasPlatform: !!ctx.platform,
        });
        throw new AuthenticationError();
      }

      const existingIdentity = await this.identityService.findUserByIdentity(ctx, ctx.uid);

      logger.info("[checkPhoneUser] Checking if current LINE identity exists", {
        phoneUid,
        currentUid: ctx.uid,
        currentPlatform: ctx.platform,
        existingIdentityUserId: existingIdentity?.id,
        targetUserId: existingUser.id,
        communityId: ctx.communityId,
      });

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
        logger.info("[checkPhoneUser] Creating new LINE identity for existing user", {
          phoneUid,
          currentUid: ctx.uid,
          currentPlatform: ctx.platform,
          userId: existingUser.id,
          communityId: ctx.communityId,
        });
        await this.identityService.addIdentityToUser(
          ctx,
          existingUser.id,
          ctx.uid,
          ctx.platform,
          ctx.communityId,
          tx,
        );
        logger.info("[checkPhoneUser] Successfully created new identity for user", {
          uid: ctx.uid,
          platform: ctx.platform,
          userId: existingUser.id,
          communityId: ctx.communityId,
        });
      }

      logger.info("[checkPhoneUser] Creating membership for user in new community", {
        phoneUid,
        userId: existingUser.id,
        communityId: ctx.communityId,
      });

      const membership = await this.membershipService.joinIfNeeded(
        ctx,
        existingUser.id,
        ctx.communityId,
        tx,
      );

      logger.info("[checkPhoneUser] Membership created, creating wallet", {
        phoneUid,
        userId: existingUser.id,
        communityId: ctx.communityId,
        membershipUserId: membership?.userId,
        membershipCommunityId: membership?.communityId,
      });

      await this.walletService.createMemberWalletIfNeeded(
        ctx,
        existingUser.id,
        ctx.communityId,
        tx,
      );

      logger.info("[checkPhoneUser] Wallet created successfully", {
        phoneUid,
        userId: existingUser.id,
        communityId: ctx.communityId,
      });

      return membership;
    });

    logger.info("[checkPhoneUser] Returning EXISTING_DIFFERENT_COMMUNITY status", {
      phoneUid,
      userId: existingUser.id,
      communityId: ctx.communityId,
      membershipUserId: membership?.userId,
      membershipCommunityId: membership?.communityId,
    });

    return {
      status: GqlPhoneUserStatus.ExistingDifferentCommunity,
      user: existingUser,
      membership: membership,
    };
  }
}
