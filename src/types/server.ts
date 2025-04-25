import { IdentityPlatform } from "@prisma/client";
import { Loaders } from "@/presentation/graphql/dataloader";
import { PrismaAuthUser, PrismaUserPermission } from "@/application/domain/account/user/data/type";

export type LoggedInUserInfo = {
  uid: string;
  tenantId: string;
  platform: IdentityPlatform;
  currentUser: PrismaAuthUser | null;
  hasPermissions: PrismaUserPermission | null;
  // TODO: add DID authentication info
  loaders: Loaders;
};

export type IContext = Record<string, never> | LoggedInUserInfo;
