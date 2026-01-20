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
import IncentiveGrantService from "@/application/domain/transaction/incentiveGrant/service";
import TransactionService from "@/application/domain/transaction/service";
import NotificationService from "@/application/domain/notification/service";
import CommunityService from "@/application/domain/account/community/service";
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
    @inject("IncentiveGrantService") private readonly incentiveGrantService: IncentiveGrantService,
    @inject("TransactionService") private readonly transactionService: TransactionService,
    @inject("NotificationService") private readonly notificationService: NotificationService,
    @inject("CommunityService") private readonly communityService: CommunityService,
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
      // Use composite key as sourceId for idempotency
      const initializationSourceId = `${userId}_${communityId}`;

      // Execute membership initialization and signup bonus grant in transaction
      const signupBonusResult = await ctx.issuer.public(ctx, async (tx) => {
        await this.membershipService.joinIfNeeded(ctx, userId, communityId, tx);
        await this.walletService.createMemberWalletIfNeeded(ctx, userId, communityId, tx);

        // Grant signup bonus if enabled (returns transaction details)
        return await this.incentiveGrantService.grantSignupBonusIfEnabled(
          ctx,
          userId,
          communityId,
          initializationSourceId,
          tx,
        );
      });

      // Refresh current points after transaction
      await ctx.issuer.internal(async (tx) => {
        await this.transactionService.refreshCurrentPoint(ctx, tx);
      });

      if (!ctx.uid) {
        logger.error("Missing uid in context");
        return null;
      }
      const user = await this.identityService.findUserByIdentity(ctx, ctx.uid);
      if (!user) {
        logger.error(`User not found after initialization: userId=${userId}`);
        return null;
      }

      // Send signup bonus notification (best-effort)
      if (signupBonusResult.granted && signupBonusResult.transaction) {
        const transaction = signupBonusResult.transaction;
        const community = await this.communityService.findCommunityOrThrow(ctx, communityId);

        this.notificationService
          .pushSignupBonusGrantedMessage(
            ctx,
            transaction.id,
            transaction.toPointChange,
            transaction.comment,
            community.name,
            userId,
          )
          .catch((error) => {
            logger.error("Failed to send signup bonus notification", {
              transactionId: transaction.id,
              userId,
              communityId,
              error,
            });
          });
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
      // Check if user exists via LINE identity (ctx.uid) even though no phone identity exists
      // This handles the case where a user has LINE Identity but no Phone Identity and no Membership
      if (ctx.uid && ctx.platform === IdentityPlatform.Line) {
        const userByLineIdentity = await this.identityService.findUserByIdentity(ctx, ctx.uid);

        if (userByLineIdentity) {
          logger.debug("[checkPhoneUser] User found via LINE identity, checking membership", {
            phoneUid,
            lineUid: ctx.uid,
            userId: userByLineIdentity.id,
            communityId: ctx.communityId,
          });

          // Check if user has membership in this community
          const existingMembershipForLineUser = await this.membershipService.findMembership(
            ctx,
            userByLineIdentity.id,
            ctx.communityId,
          );

          if (existingMembershipForLineUser) {
            // User has LINE Identity and Membership, just needs Phone Identity linked
            logger.debug("[checkPhoneUser] User has LINE identity and membership, linking phone identity", {
              phoneUid,
              lineUid: ctx.uid,
              userId: userByLineIdentity.id,
              communityId: ctx.communityId,
            });

            await ctx.issuer.public(ctx, async (tx) => {
              await this.identityService.linkPhoneIdentity(ctx, userByLineIdentity.id, phoneUid, tx);
            });

            return {
              status: GqlPhoneUserStatus.ExistingSameCommunity,
              user: userByLineIdentity,
              membership: existingMembershipForLineUser,
            };
          } else {
            // User has LINE Identity but no Membership - create membership and link phone identity
            logger.debug("[checkPhoneUser] User has LINE identity but no membership, creating membership and linking phone", {
              phoneUid,
              lineUid: ctx.uid,
              userId: userByLineIdentity.id,
              communityId: ctx.communityId,
            });

            const membership = await ctx.issuer.public(ctx, async (tx) => {
              // Link phone identity to existing user
              await this.identityService.linkPhoneIdentity(ctx, userByLineIdentity.id, phoneUid, tx);

              // Create membership
              const newMembership = await this.membershipService.joinIfNeeded(
                ctx,
                userByLineIdentity.id,
                ctx.communityId,
                tx,
              );

              // Create wallet
              await this.walletService.createMemberWalletIfNeeded(
                ctx,
                userByLineIdentity.id,
                ctx.communityId,
                tx,
              );

              return newMembership;
            });

            logger.debug("[checkPhoneUser] Created membership for LINE user without membership", {
              phoneUid,
              lineUid: ctx.uid,
              userId: userByLineIdentity.id,
              communityId: ctx.communityId,
              membershipUserId: membership?.userId,
            });

            return {
              status: GqlPhoneUserStatus.ExistingDifferentCommunity,
              user: userByLineIdentity,
              membership: membership,
            };
          }
        }
      }

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
      // Check if LINE identity exists for this user in this community, and create if not
      // This handles the case where a user has a membership but logged in via a different LINE channel
      if (ctx.uid && ctx.platform === IdentityPlatform.Line) {
        // Perform identity check and creation within the same transaction to avoid race conditions
        // This follows the same pattern as EXISTING_DIFFERENT_COMMUNITY case
        await ctx.issuer.public(ctx, async (tx) => {
          const existingLineIdentity = await this.identityService.findUserByIdentity(ctx, ctx.uid!);

          logger.debug("[checkPhoneUser] Checking LINE identity for EXISTING_SAME_COMMUNITY", {
            phoneUid,
            currentUid: ctx.uid,
            currentPlatform: ctx.platform,
            existingLineIdentityUserId: existingLineIdentity?.id,
            targetUserId: existingUser.id,
            communityId: ctx.communityId,
          });

          if (existingLineIdentity) {
            if (existingLineIdentity.id !== existingUser.id) {
              logger.error("[checkPhoneUser] LINE identity already linked to another user", {
                uid: ctx.uid,
                platform: ctx.platform,
                existingUserId: existingLineIdentity.id,
                attemptedUserId: existingUser.id,
                communityId: ctx.communityId,
              });
              throw new Error("This LINE account is already linked to another user");
            }
            logger.debug("[checkPhoneUser] LINE identity already exists for this user, skipping creation", {
              uid: ctx.uid,
              platform: ctx.platform,
              userId: existingUser.id,
              communityId: ctx.communityId,
            });
          } else {
            logger.debug("[checkPhoneUser] Creating new LINE identity for existing membership user", {
              phoneUid,
              currentUid: ctx.uid,
              currentPlatform: ctx.platform,
              userId: existingUser.id,
              communityId: ctx.communityId,
            });
            await this.identityService.addIdentityToUser(
              ctx,
              existingUser.id,
              ctx.uid!,
              ctx.platform!,
              ctx.communityId,
              tx,
            );
            logger.debug("[checkPhoneUser] Successfully created LINE identity for existing membership user", {
              uid: ctx.uid,
              platform: ctx.platform,
              userId: existingUser.id,
              communityId: ctx.communityId,
            });
          }
        });
      }

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
