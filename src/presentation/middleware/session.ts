import { Request, Response } from "express";
import { auth } from "@/infrastructure/libs/firebase";
import logger from "@/infrastructure/logging";
import { SESSION_EXPIRATION_MS, SESSION_COOKIE_NAME } from "@/config/constants";
import CommunityConfigService from "@/application/domain/account/community/config/service";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

import { container } from "tsyringe";

export async function handleSessionLogin(req: Request, res: Response) {
  const { idToken } = req.body;
  const communityId = req.headers["x-community-id"] as string | undefined;

  logger.debug("📥 [handleSessionLogin] Incoming request", {
    hasIdToken: !!idToken,
    communityId,
    origin: req.headers.origin,
    referer: req.headers.referer,
    userAgent: req.headers["user-agent"],
    cookiesPresent: Object.keys(req.cookies || {}).length,
    timestamp: new Date().toISOString(),
  });

  if (!idToken) {
    logger.warn("⚠️ [handleSessionLogin] Missing idToken in request body", {
      path: req.path,
      method: req.method,
    });
    return res.status(400).json({ error: "Missing idToken" });
  }

  if (!communityId) {
    logger.warn("⚠️ [handleSessionLogin] Missing x-community-id header");
    return res.status(400).json({ error: "Missing x-community-id header" });
  }

  const expiresIn = SESSION_EXPIRATION_MS;

  try {
    const issuer = new PrismaClientIssuer();
    const configService = container.resolve(CommunityConfigService);
    const tenantId = await configService.getFirebaseTenantId(issuer, communityId);

    const tenantedAuth = auth.tenantManager().authForTenant(tenantId);

    logger.debug("🧩 [handleSessionLogin] Creating tenanted session cookie", {
      expiresInMs: expiresIn,
      tenantId,
      communityId,
    });

    const sessionCookie = await tenantedAuth.createSessionCookie(idToken, { expiresIn });

    logger.debug("✅ [handleSessionLogin] Session cookie created", {
      expiresAt: new Date(Date.now() + expiresIn).toISOString(),
      tenantId,
    });

    // Clear legacy "session" cookie to migrate clients to "__session"
    res.clearCookie("session", { path: "/" });

    // Set canonical "__session" cookie (path: "/" maintained for GraphQL endpoint compatibility)
    res.cookie(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    logger.debug("🍪 [handleSessionLogin] Cookie set on response", {
      cookieName: SESSION_COOKIE_NAME,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: expiresIn,
    });

    return res.json({ status: "success" });
  } catch (err: any) {
    logger.error("🔥 [handleSessionLogin] Session login failed", {
      message: err.message,
      code: err.code,
      stack: err.stack,
      communityId,
      idTokenLength: idToken?.length,
      timestamp: new Date().toISOString(),
    });
    return res.status(401).json({ error: err.message || "Unauthorized" });
  }
}
