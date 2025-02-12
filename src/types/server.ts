import { IdentityPlatform, Role } from "@prisma/client";
import { GqlUser } from "@/types/graphql";

export type LoggedInUserInfo = {
  uid: string;
  platform: IdentityPlatform;
  currentUser: GqlUser | null;
  memberships: { communityId: string; role: Role }[];
  opportunitiesCreatedBy: { id: string }[];
};

export type IContext = Record<string, never> | LoggedInUserInfo;
