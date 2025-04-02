import { IdentityPlatform } from "@prisma/client";

//TODO  add neo88 community id
export const initialCommunityId = "";

export const SignInProvider: Record<string, IdentityPlatform> = {
  "oidc.line": IdentityPlatform.LINE,
  "facebook.com": IdentityPlatform.FACEBOOK,
};
