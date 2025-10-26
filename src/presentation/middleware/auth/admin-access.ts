import crypto from "crypto";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { createLoaders } from "@/presentation/graphql/dataloader";
import logger from "@/infrastructure/logging";
import { AuthHeaders, AuthResult } from "./types";

export async function handleAdminAccess(headers: AuthHeaders): Promise<AuthResult | null> {
  const { adminApiKey, communityId } = headers;
  const expectedAdminKey = process.env.CIVICSHIP_ADMIN_API_KEY;

  if (!adminApiKey || !expectedAdminKey) return null;

  const isValid =
    adminApiKey.length === expectedAdminKey.length &&
    crypto.timingSafeEqual(Buffer.from(adminApiKey), Buffer.from(expectedAdminKey));

  if (!isValid) {
    logger.warn("🚫 Invalid admin API key");
    return null;
  }

  if (!communityId) throw new Error("Missing x-community-id header");

  const issuer = new PrismaClientIssuer();
  const loaders = createLoaders(issuer);
  logger.info(`👑 Admin access granted for community ${communityId}`);

  return { issuer, loaders, communityId, isAdmin: true };
}
