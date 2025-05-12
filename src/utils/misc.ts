import { IdentityPlatform } from "@prisma/client";

export const getPlatform = (providerId?: string): IdentityPlatform | undefined => {
  switch (providerId) {
    case "oidc.line":
      return IdentityPlatform.LINE;
    default:
      return undefined;
  }
};
