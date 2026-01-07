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
import TransactionService from "@/application/domain/transaction/service";
import SignupBonusConfigService from "@/application/domain/account/community/config/incentive/signup/service";
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
    @inject("TransactionService") private readonly transactionService: TransactionService,
    @inject("SignupBonusConfigService")
    private readonly signupBonusConfigService: SignupBonusConfigService,
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

      // Grant signup bonus (best-effort - don't fail signup if bonus grant fails)
      await this.grantSignupBonusIfEnabledBestEffort(ctx, userId, communityId);

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

  /**
   * Grant signup bonus if enabled (best-effort pattern).
   * Errors are logged but not propagated - user signup should always succeed.
   */
  private async grantSignupBonusIfEnabledBestEffort(
    ctx: IContext,
    userId: string,
    communityId: string,
  ): Promise<void> {
    try {
      // Check if signup bonus is enabled for this community
      const config = await this.signupBonusConfigService.get(ctx, communityId);

      if (!config || !config.isEnabled) {
        logger.debug("Signup bonus not enabled for community", { communityId });
        return;
      }

      // Get user's wallet
      const wallet = await this.walletService.findMemberWallet(ctx, userId, communityId);
      if (!wallet) {
        logger.warn("Wallet not found for signup bonus grant (wallet creation may have failed)", {
          userId,
          communityId,
        });
        return;
      }

      // Check if community wallet has enough balance
      try {
        const communityWallet = await this.walletService.findCommunityWalletOrThrow(ctx, communityId);
        const { currentPoint } = communityWallet.currentPointView || {};

        if (currentPoint == null) {
          logger.warn("Current point is not available for community wallet", {
            communityId,
            userId,
          });
        } else if (currentPoint < BigInt(config.bonusPoint)) {
          logger.error("Insufficient balance in community wallet for signup bonus (skipping grant)", {
            userId,
            communityId,
            availableBalance: currentPoint.toString(),
            requiredBalance: config.bonusPoint,
          });

          // Skip the grant attempt due to insufficient balance
          return;
        }
      } catch (error) {
        logger.warn("Failed to check community wallet balance", {
          userId,
          communityId,
          error: error instanceof Error ? error.message : String(error),
        });
        // Continue with the grant attempt even if balance check fails
      }

      // Grant signup bonus
      const result = await this.transactionService.grantSignupBonus(ctx, {
        userId,
        communityId,
        toWalletId: wallet.id,
        bonusPoint: config.bonusPoint,
        message: config.message ?? undefined,
      });

      if (result.status === "COMPLETED") {
        logger.info("Signup bonus granted successfully", {
          userId,
          communityId,
          bonusPoint: config.bonusPoint,
          transactionId: result.transaction.id,
        });
      } else if (result.status === "SKIPPED_ALREADY_COMPLETED") {
        logger.info("Signup bonus already granted (duplicate signup attempt)", {
          userId,
          communityId,
          transactionId: result.transaction.id,
        });
      } else if (result.status === "SKIPPED_PENDING") {
        logger.warn("Signup bonus grant is already pending (concurrent signup)", {
          userId,
          communityId,
          grantId: result.grantId,
        });
      } else if (result.status === "FAILED") {
        logger.error("Signup bonus grant failed (recorded as FAILED grant for manual retry)", {
          userId,
          communityId,
          grantId: result.grantId,
          failureCode: result.failureCode,
          lastError: result.lastError,
        });
      }
    } catch (error) {
      // Best-effort: log error but don't fail user signup
      logger.error("Unexpected error during signup bonus grant (握りつぶす)", {
        userId,
        communityId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
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

    logger.debug("[checkPhoneUser] Starting phone user check", {
      phoneUid,
      communityId: ctx.communityId,
      uid: ctx.uid,
      platform: ctx.platform,
    });

    const existingUser = await this.identityService.findUserByIdentity(ctx, phoneUid);

    logger.debug("[checkPhoneUser] User lookup result", {
      phoneUid,
      existingUserId: existingUser?.id,
      existingUserFound: !!existingUser,
      communityId: ctx.communityId,
    });

    if (!existingUser) {
      logger.debug("[checkPhoneUser] Returning NEW_USER status", {
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

    logger.debug("[checkPhoneUser] Membership lookup result", {
      phoneUid,
      userId: existingUser.id,
      communityId: ctx.communityId,
      membershipFound: !!existingMembership,
      membershipUserId: existingMembership?.userId,
      membershipCommunityId: existingMembership?.communityId,
    });

    if (existingMembership) {
      logger.debug("[checkPhoneUser] Returning EXISTING_SAME_COMMUNITY status", {
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

    logger.debug(
      "[checkPhoneUser] User exists but no membership in current community, proceeding with EXISTING_DIFFERENT_COMMUNITY flow",
      {
        phoneUid,
        userId: existingUser.id,
        communityId: ctx.communityId,
        currentUid: ctx.uid,
        currentPlatform: ctx.platform,
      },
    );

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

      logger.debug("[checkPhoneUser] Checking if current LINE identity exists", {
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
        logger.debug("Identity already exists for this user, skipping creation", {
          uid: ctx.uid,
          platform: ctx.platform,
          userId: existingUser.id,
          communityId: ctx.communityId,
        });
      } else {
        logger.debug("[checkPhoneUser] Creating new LINE identity for existing user", {
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
        logger.debug("[checkPhoneUser] Successfully created new identity for user", {
          uid: ctx.uid,
          platform: ctx.platform,
          userId: existingUser.id,
          communityId: ctx.communityId,
        });
      }

      logger.debug("[checkPhoneUser] Creating membership for user in new community", {
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

      logger.debug("[checkPhoneUser] Membership created, creating wallet", {
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

      logger.debug("[checkPhoneUser] Wallet created successfully", {
        phoneUid,
        userId: existingUser.id,
        communityId: ctx.communityId,
      });

      return membership;
    });

    logger.debug("[checkPhoneUser] Returning EXISTING_DIFFERENT_COMMUNITY status", {
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
