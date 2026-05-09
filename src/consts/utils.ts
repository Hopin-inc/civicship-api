import { GqlIdentityPlatform } from "@/types/graphql";

export const SignInProvider: Record<string, GqlIdentityPlatform> = {
  "oidc.line": GqlIdentityPlatform.GqlLine,
  "facebook.com": GqlIdentityPlatform.GqlFacebook,
  "phone": GqlIdentityPlatform.GqlPhone,
};

export const IDENTUS_API_URL = process.env.IDENTUS_API_URL || "https://kyoso-identus-api.example.com";
