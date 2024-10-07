import { IdentityPlatform, User } from "@prisma/client";

type LoggedInUserInfo = {
  uid: string;
  platform: IdentityPlatform;
  currentUser: User | undefined;
};
export type IContext = (
  | Record<string, never>
  | LoggedInUserInfo
);
