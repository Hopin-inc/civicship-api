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

  async createUserAndIdentity(
    data: Prisma.UserCreateInput,
    uid: string,
    platform: IdentityPlatform,
    phoneUid?: string,
  ) {
    const identityCreate = phoneUid
      ? {
          create: [
            { uid, platform },
            { uid: phoneUid, platform: IdentityPlatform.PHONE },
          ],
        }
      : { create: { uid, platform } };

    return this.userRepository.create({
      ...data,
      identities: identityCreate,
    });
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

    await tx.identity.create({
      data: {
        uid: phoneUid,
        platform: IdentityPlatform.PHONE,
        userId: userId,
      },
    });

    return this.userRepository.find(ctx, userId);
  }

  async findUserByIdentity(ctx: IContext, uid: string): Promise<User | null> {
    const identity = await this.identityRepository.find(uid);
    if (identity) {
      return await this.userRepository.find(ctx, identity.userId);
    }
    return null;
  }

  async deleteUserAndIdentity(uid: string): Promise<User | null> {
    const identity = await this.identityRepository.find(uid);
    if (identity) {
      return this.userRepository.delete(identity.userId);
    } else {
      return null;
    }
  }

  async deleteFirebaseAuthUser(uid: string, tenantId: string): Promise<void> {
    const tenantedAuth = auth.tenantManager().authForTenant(tenantId);
    return tenantedAuth.deleteUser(uid);
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
    authToken: string,
    refreshToken: string,
    expiryTime: Date,
  ): Promise<void> {
    await this.identityRepository.update(uid, {
      authToken,
      refreshToken,
      tokenExpiresAt: expiryTime,
    });
  }
}
