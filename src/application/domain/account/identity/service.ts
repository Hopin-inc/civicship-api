import { auth } from "@/infrastructure/libs/firebase";
import { IUserRepository } from "@/application/domain/account/user/data/interface";
import { IIdentityRepository } from "@/application/domain/account/identity/data/interface";
import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { Prisma, IdentityPlatform, User } from "@prisma/client";
import logger from "@/infrastructure/logging";
import { FirebaseTokenRefreshResponse } from "@/application/domain/account/identity/data/type";

@injectable()
export default class IdentityService {
  constructor(
    @inject("UserRepository") private readonly userRepository: IUserRepository,
    @inject("IdentityRepository") private readonly identityRepository: IIdentityRepository,
  ) {}

  async createUserAndIdentity(data: Prisma.UserCreateInput) {
    if (data.identities && typeof data.identities === "object" && "create" in data.identities) {
      const identities = data.identities.create;
      const identityArray = Array.isArray(identities) ? identities : [identities];

      for (const identity of identityArray) {
        if (!identity) continue;

        const identityData = identity as { platform?: IdentityPlatform; uid?: string; communityId?: string | null };
        if (
          identityData.platform === IdentityPlatform.PHONE &&
          !identityData.communityId &&
          identityData.uid
        ) {
          const existingPhoneIdentity = await this.identityRepository.findByUid(identityData.uid);
          if (existingPhoneIdentity && existingPhoneIdentity.platform === IdentityPlatform.PHONE) {
            throw new Error(`Phone identity with UID ${identityData.uid} already exists`);
          }
        }
      }
    }

    return this.userRepository.create({
      ...data,
    });
  }

  async addIdentityToUser(
    ctx: IContext,
    userId: string,
    uid: string,
    platform: IdentityPlatform,
    communityId: string | null,
    tx?: Prisma.TransactionClient,
  ) {
    // PHONE以外のtokenは不要
    const data: Prisma.IdentityCreateInput = {
      uid,
      platform,
      user: {
        connect: { id: userId },
      },
    };

    if (communityId) {
      data.community = {
        connect: { id: communityId },
      };
    }

    await this.identityRepository.create(ctx, data, tx);
  }

  async findGlobalIdentity(uid: string, platform: IdentityPlatform) {
    return this.identityRepository.findByUidAndCommunity(uid, platform, null);
  }

  async linkPhoneIdentity(
    ctx: IContext,
    userId: string,
    phoneUid: string,
    tx: {
      user: {
        findUnique: (args: {
          where: { id: string };
          select: { id: boolean };
        }) => Promise<{ id: string } | null>;
      };
      identity: {
        findFirst: (args: {
          where: { uid: string; platform: IdentityPlatform; communityId: null };
        }) => Promise<{ uid: string } | null>;
        create: (args: {
          data: { uid: string; platform: IdentityPlatform; userId: string };
        }) => Promise<unknown>;
      };
    },
  ) {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const existingPhoneIdentity = await tx.identity.findFirst({
      where: {
        uid: phoneUid,
        platform: IdentityPlatform.PHONE,
        communityId: null,
      },
    });

    if (existingPhoneIdentity) {
      throw new Error(`Phone identity with UID ${phoneUid} already exists`);
    }

    await tx.identity.create({
      data: {
        uid: phoneUid,
        platform: IdentityPlatform.PHONE,
        userId: userId,
      },
    });

    return this.userRepository.find(ctx, userId);
  }

  async findUserByIdentity(ctx: IContext, uid: string, communityId?: string | null): Promise<User | null> {
    // First, try to find identity with the specified communityId
    let identity = await this.identityRepository.find(uid, communityId);
    
    // If not found and communityId was specified, also try to find global identity (communityId = null)
    // This handles the case where LINE identities are created as global identities
    if (!identity && communityId) {
      identity = await this.identityRepository.find(uid, null);
    }
    
    if (identity) {
      return await this.userRepository.find(ctx, identity.userId);
    }
    return null;
  }

  async findUserByUid(ctx: IContext, uid: string): Promise<User | null> {
    const identity = await this.identityRepository.findByUid(uid);
    if (identity) {
      return await this.userRepository.find(ctx, identity.userId);
    }
    return null;
  }

  async deleteUserAndIdentity(uid: string, communityId?: string | null): Promise<User | null> {
    const identity = await this.identityRepository.find(uid, communityId);
    if (identity) {
      return this.userRepository.delete(identity.userId);
    } else {
      return null;
    }
  }

  async deleteFirebaseAuthUser(uid: string): Promise<void> {
    return auth.deleteUser(uid);
  }

  async fetchNewIdToken(refreshToken: string): Promise<FirebaseTokenRefreshResponse> {
    const res = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${process.env.FIREBASE_TOKEN_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      logger.error(`Firebase token refresh failed: ${res.status} ${res.statusText}`, { errorText });
      throw new Error(`Firebase token refresh failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return {
      idToken: data.id_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  async storeAuthTokens(
    uid: string,
    communityId: string | null,
    authToken: string,
    refreshToken: string,
    expiryTime: Date,
  ): Promise<void> {
    await this.identityRepository.update(uid, communityId, {
      authToken,
      refreshToken,
      tokenExpiresAt: expiryTime,
    });
  }
}
