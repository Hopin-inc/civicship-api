import { IdentityPlatform } from "@prisma/client";

export const SignInProvider: Record<string, IdentityPlatform> = {
  "oidc.line": IdentityPlatform.LINE,
  "facebook.com": IdentityPlatform.FACEBOOK,
};
