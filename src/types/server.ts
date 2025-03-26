import { IdentityPlatform } from "@prisma/client";
import { GqlUser } from "@/types/graphql";
import { Loaders } from "@/presentation/graphql/dataloader";
import { PrismaUserPermission } from "@/application/domain/user/data/type";

export type LoggedInUserInfo = {
  uid: string;
  platform: IdentityPlatform;
  currentUser: GqlUser | null;
  hasPermissions: PrismaUserPermission | null;
  loaders: Loaders;
};

export type IContext = Record<string, never> | LoggedInUserInfo;
