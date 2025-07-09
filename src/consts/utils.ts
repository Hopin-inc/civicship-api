import { GqlIdentityPlatform } from "@/types/graphql";

export const SignInProvider: Record<string, GqlIdentityPlatform> = {
  "oidc.line": GqlIdentityPlatform.Line,
  "facebook.com": GqlIdentityPlatform.Facebook,
  "phone": GqlIdentityPlatform.Phone,
};

export const IDENTUS_API_URL = process.env.IDENTUS_API_URL || "https://kyoso-identus-api.example.com";
export const IDENTUS_API_TIMEOUT = parseInt(process.env.IDENTUS_API_TIMEOUT || "30000", 10);
