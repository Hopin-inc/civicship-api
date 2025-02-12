import { IdentityPlatform } from "@prisma/client";
import { AuthGetPayloadWithArgs } from "@/domains/user/type";

export type LoggedInUserInfo = {
  uid: string;
  platform: IdentityPlatform;
  currentUser: AuthGetPayloadWithArgs | null;
};

export type IContext = Record<string, never> | LoggedInUserInfo;
