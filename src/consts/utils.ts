import { GqlIdentityPlatform as IdentityPlatform } from "@/types/graphql";

export const SignInProvider: Record<string, IdentityPlatform> = {
  "oidc.line": IdentityPlatform.Line,
  "facebook.com": IdentityPlatform.Facebook,
  "phone": IdentityPlatform.Phone,
};

export const IDENTUS_API_URL = process.env.IDENTUS_API_URL || "https://kyoso-identus-api.example.com";
