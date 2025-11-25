import { Request, Response } from "express";
import { auth } from "@/infrastructure/libs/firebase";
import logger from "@/infrastructure/logging";
import { SESSION_EXPIRATION_MS, SESSION_COOKIE_NAME } from "@/config/constants";

export async function handleSessionLogin(req: Request, res: Response) {
  const { idToken } = req.body;

  logger.info("📥 [handleSessionLogin] Incoming request", {
    hasIdToken: !!idToken,
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

  const expiresIn = SESSION_EXPIRATION_MS;

  try {
    logger.debug("🧩 [handleSessionLogin] Creating session cookie from Firebase idToken", {
      expiresInMs: expiresIn,
    });

    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    logger.info("✅ [handleSessionLogin] Session cookie created", {
      expiresAt: new Date(Date.now() + expiresIn).toISOString(),
    });

    // Clear legacy "session" cookie to migrate clients to "__session"
    res.clearCookie("session", { path: "/" });

    // Set canonical "__session" cookie for Firebase Hosting compliance
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
      idTokenLength: idToken?.length,
      timestamp: new Date().toISOString(),
    });
    return res.status(401).json({ error: err.message || "Unauthorized" });
  }
}
