import { IdentityPlatform } from "@prisma/client";

export const SignInProvider: Record<string, IdentityPlatform> = {
  "oidc.line": IdentityPlatform.LINE,
  "facebook.com": IdentityPlatform.FACEBOOK,
  "phone": IdentityPlatform.PHONE,
};

export const IDENTUS_API_URL = process.env.IDENTUS_API_URL || "https://kyoso-identus-api.example.com";
