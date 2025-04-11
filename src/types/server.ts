import { IdentityPlatform } from "@prisma/client";
import { Loaders } from "@/presentation/graphql/dataloader";
import { PrismaAuthUser, PrismaUserPermission } from "@/application/domain/user/data/type";

export type LoggedInUserInfo = {
  uid: string;
  platform: IdentityPlatform;
  currentUser: PrismaAuthUser | null;
  hasPermissions: PrismaUserPermission | null;
  loaders: Loaders;
};

export type IContext = Record<string, never> | LoggedInUserInfo;
