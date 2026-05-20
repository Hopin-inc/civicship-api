import { GqlIdentityPlatform } from "@/types/graphql";

export const SignInProvider: Record<string, GqlIdentityPlatform> = {
  "oidc.line": GqlIdentityPlatform.Line,
  "facebook.com": GqlIdentityPlatform.Facebook,
  "phone": GqlIdentityPlatform.Phone,
};
