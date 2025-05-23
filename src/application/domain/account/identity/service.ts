import { auth } from "@/infrastructure/libs/firebase";
import { IUserRepository } from "@/application/domain/account/user/data/interface";
import { IIdentityRepository } from "@/application/domain/account/identity/data/interface";
import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import axios, { AxiosError } from "axios";
import { IDENTUS_API_URL } from "@/consts/utils";
import logger from "@/infrastructure/logging";
import { GqlIdentityPlatform as IdentityPlatform, GqlUser as User } from "@/types/graphql";
import { prismaClient } from "@/infrastructure/prisma/client";

@injectable()
export default class IdentityService {
  constructor(
    @inject("UserRepository") private readonly userRepository: IUserRepository,
    @inject("IdentityRepository") private readonly identityRepository: IIdentityRepository,
  ) {}

  async createUserAndIdentity(
    data: any, // Replace Prisma.UserCreateInput with any
    uid: string,
    platform: IdentityPlatform,
    phoneUid?: string,
  ) {
    const identityCreate = phoneUid
      ? { create: [{ uid, platform }, { uid: phoneUid, platform: IdentityPlatform.Phone }] }
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
    tx: any, // Replace Prisma.TransactionClient with any
  ) {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    await tx.identity.create({
      data: {
        uid: phoneUid,
        platform: IdentityPlatform.Phone,
        userId: userId
      }
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

  async getAuthToken(uid: string): Promise<{ token: string | null; isValid: boolean }> {
    const identity = await this.identityRepository.find(uid);

    if (!identity || !identity.authToken || !identity.tokenExpiresAt) {
      return { token: null, isValid: false };
    }

    const now = new Date();
    const isExpired = identity.tokenExpiresAt < now;

    if (isExpired && identity.refreshToken) {
      try {
        const newTokens = await this.refreshAuthToken(uid, identity.refreshToken);
        return { token: newTokens.authToken, isValid: true };
      } catch (error) {
        logger.error("Failed to refresh token:", error);
        return { token: null, isValid: false };
      }
    }

    return {
      token: identity.authToken,
      isValid: !isExpired
    };
  }

  async refreshAuthToken(uid: string, refreshToken: string): Promise<{ authToken: string; refreshToken: string; expiryTime: Date }> {
    try {
      const response = await axios.post(`${IDENTUS_API_URL}/auth/refresh`, {
        refreshToken,
      });

      const { token, refreshToken: newRefreshToken, expiresIn } = response.data;

      const expiryTime = new Date();
      expiryTime.setSeconds(expiryTime.getSeconds() + expiresIn);

      await this.storeAuthTokens(uid, token, newRefreshToken, expiryTime);

      return {
        authToken: token,
        refreshToken: newRefreshToken,
        expiryTime,
      };
    } catch (error) {
      logger.error("Token refresh failed:", error);
      throw new Error("Failed to refresh authentication token");
    }
  }

  async callDIDVCServer(
    uid: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: any,
  ): Promise<any> {
    const { token, isValid } = await this.getAuthToken(uid);

    if (!token || !isValid) {
      throw new Error("No valid authentication token available");
    }

    try {
      const url = `${IDENTUS_API_URL}${endpoint}`;
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      let response;
      switch (method) {
        case 'GET':
          response = await axios.get(url, { headers });
          break;
        case 'POST':
          response = await axios.post(url, data, { headers });
          break;
        case 'PUT':
          response = await axios.put(url, data, { headers });
          break;
        case 'DELETE':
          response = await axios.delete(url, { headers });
          break;
      }

      return response?.data;
    } catch (error) {
      logger.error(`Error calling DID/VC server at ${endpoint}:`, error);

      if (axios.isAxiosError(error) && (error as AxiosError).response?.status === 401) {
        const identity = await this.identityRepository.find(uid);

        if (identity?.refreshToken) {
          try {
            await this.refreshAuthToken(uid, identity.refreshToken);
            return this.callDIDVCServer(uid, endpoint, method, data);
          } catch (refreshError) {
            logger.error("Failed to refresh token during API call:", refreshError);
            throw new Error("Authentication failed and token refresh was unsuccessful");
          }
        }
      }

      throw error;
    }
  }

  async requestDIDIssuance(
    userId: string,
    phoneUid: string,
  ): Promise<{ success: boolean; requestId: string }> {
    try {
      const { token, isValid } = await this.getAuthToken(phoneUid);
      
      if (!token || !isValid) {
        throw new Error("No valid authentication token available for DID issuance");
      }
      
      const didRequest = await prismaClient.dIDIssuanceRequest.create({
        data: {
          userId,
          status: 'PENDING',
        }
      });
      
      try {
        const didResponse = await this.callDIDVCServer(
          phoneUid,
          '/did/issue',
          'POST',
          {
            userId,
            requestId: didRequest.id
          }
        );
        
        if (didResponse?.didValue) {
          await prismaClient.dIDIssuanceRequest.update({
            where: { id: didRequest.id },
            data: {
              status: 'COMPLETED',
              didValue: didResponse.didValue,
              completedAt: new Date()
            }
          });
          
          return { success: true, requestId: didRequest.id };
        }
        
        return { success: true, requestId: didRequest.id };
      } catch (error) {
        await prismaClient.dIDIssuanceRequest.update({
          where: { id: didRequest.id },
          data: {
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error occurred during DID issuance',
          }
        });
        
        logger.error("Failed to issue DID:", error);
        return { success: false, requestId: didRequest.id };
      }
    } catch (error) {
      logger.error("Error in requestDIDIssuance:", error);
      throw error;
    }
  }
}
