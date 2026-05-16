import { Request, Response, NextFunction } from "express";
import { auth } from "@/infrastructure/libs/firebase";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";

export async function validateFirebasePhoneAuth(req: Request, res: Response, next: NextFunction) {
  const idToken = req.headers["authorization"]?.replace(/^Bearer\s+/, "");

  if (!idToken) {
    res.status(401).json({ error: "Firebase ID token is required" });
    return;
  }

  try {
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const issuer = new PrismaClientIssuer();
    const user = await issuer.internal(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: { identities: { some: { uid } } },
      });

      if (existingUser) {
        logger.debug(`👤 Existing user found for uid=${uid}, userId=${existingUser.id}`);
        return existingUser;
      }

      logger.debug(`🆕 Creating new user for uid=${uid}`);
      
      const newUser = await tx.user.create({
        data: {
          name: "名前未設定",
          slug: "名前未設定",
          currentPrefecture: "UNKNOWN",
          identities: {
            create: [
              {
                uid,
                platform: "PHONE",
              },
            ],
          },
        },
      });

      logger.debug(`✅ New user created: userId=${newUser.id}`);
      return newUser;
    });

    res.locals.user = user;
    res.locals.uid = uid;
    next();
  } catch (error) {
    logger.error("Firebase phone auth validation error:", error);
    res.status(401).json({ error: "Invalid Firebase ID token" });
  }
}
