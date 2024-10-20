import { IdentityPlatform, User } from "@prisma/client";

type LoggedInUserInfo = {
  uid: string;
  platform: IdentityPlatform;
  currentUser: User | null;
};
export type IContext = (
  | Record<string, never>
  | LoggedInUserInfo
);
