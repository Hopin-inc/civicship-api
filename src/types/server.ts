import { Loaders } from "@/presentation/graphql/dataloader";
import { PrismaAuthUser } from "@/application/domain/account/user/data/type";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlIdentityPlatform as IdentityPlatform } from "@/types/graphql";

export type LoggedInUserInfo = {
  issuer: PrismaClientIssuer;
  loaders: Loaders;

  tenantId?: string;
  communityId: string;
  platform?: IdentityPlatform;
  uid?: string;
  phoneUid?: string;

  currentUser?: PrismaAuthUser | null;
  isAdmin?: boolean;

  phoneAuthToken?: string;
  phoneRefreshToken?: string;
  phoneTokenExpiresAt?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  idToken?: string;
  // TODO: add DID authentication info
};

export type IContext = Record<string, never> | LoggedInUserInfo;
