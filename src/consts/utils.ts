import { IdentityPlatform } from "@prisma/client";

export const SignInProvider: Record<string, IdentityPlatform> = {
  "oidc.line": IdentityPlatform.LINE,
  "facebook.com": IdentityPlatform.FACEBOOK,
  "phone": IdentityPlatform.PHONE,
};

export const DID_VC_API_URL = process.env.DID_VC_API_URL || "https://kyoso-identus-api.example.com";
