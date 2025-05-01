import { IdentityPlatform } from "@prisma/client";
import { Loaders } from "@/presentation/graphql/dataloader";
import { PrismaAuthUser, PrismaUserPermission } from "@/application/domain/account/user/data/type";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

export type LoggedInUserInfo = {
  uid: string;
  tenantId: string;
  platform: IdentityPlatform;
  currentUser: PrismaAuthUser | null;
  hasPermissions: PrismaUserPermission | null;
  // TODO: add DID authentication info
  loaders: Loaders;
  issuer: PrismaClientIssuer;
};

export type IContext = Record<string, never> | LoggedInUserInfo;
