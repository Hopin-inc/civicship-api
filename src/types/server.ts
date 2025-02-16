import { IdentityPlatform, Role } from "@prisma/client";
import { GqlUser } from "@/types/graphql";
import { Loaders } from "@/presentation/graphql/dataloader";

export type LoggedInUserInfo = {
  uid: string;
  platform: IdentityPlatform;
  currentUser: GqlUser | null;
  memberships: { communityId: string; role: Role }[];
  opportunitiesCreatedBy: { id: string }[];
  loaders: Loaders;
};

export type IContext = Record<string, never> | LoggedInUserInfo;
