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
  idToken?: string;

  currentUser?: PrismaAuthUser | null;
  isAdmin?: boolean;
};

export type IContext = Record<string, never> | LoggedInUserInfo;
