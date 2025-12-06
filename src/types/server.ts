import { Loaders } from "@/presentation/graphql/dataloader";
import { PrismaAuthUser } from "@/application/domain/account/user/data/type";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlIdentityPlatform as IdentityPlatform } from "@/types/graphql";

export type AuthMeta = {
  authMode: "id_token" | "session" | "admin" | "anonymous";
  hasIdToken: boolean;
  hasCookie: boolean;
};

export type LoggedInUserInfo = {
  issuer: PrismaClientIssuer;
  loaders: Loaders;

  tenantId?: string;
  communityId: string;
  platform?: IdentityPlatform;
  uid?: string;
  idToken?: string;

  currentUser?: PrismaAuthUser | null;
  isAdmin?: boolean;
  authMeta?: AuthMeta;
};

export type IContext = Record<string, never> | LoggedInUserInfo;
