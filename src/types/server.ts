import { IdentityPlatform, Role } from "@prisma/client";
import { GqlUser } from "@/types/graphql";

export type LoggedInUserInfo = {
  uid: string;
  platform: IdentityPlatform;
  currentUser: GqlUser | null;
  memberships: { communityId: string; role: Role }[];
};

export type IContext = Record<string, never> | LoggedInUserInfo;
