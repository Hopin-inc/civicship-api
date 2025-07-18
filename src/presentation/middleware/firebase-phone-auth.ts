import { Request, Response, NextFunction } from 'express';
import { auth } from "@/infrastructure/libs/firebase";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";

export async function validateFirebasePhoneAuth(req: Request, res: Response, next: NextFunction) {
  const idToken = req.headers['authorization']?.replace(/^Bearer\s+/, '');

  if (!idToken) {
    res.status(401).json({ error: 'Firebase ID token is required' });
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

      if (existingUser) return existingUser;

      const newUser = await tx.user.create({
        data: {
          name: "名前未設定",
          slug: "名前未設定",
          currentPrefecture: 'UNKNOWN',
          identities: {
            create: [
              {
                uid,
                platform: 'PHONE',
              },
            ],
          },
        },
      });

      return newUser;
    });

    (req as any).user = user;
    (req as any).uid = uid;
    next();
  } catch (error) {
    logger.error('Firebase phone auth validation error:', error);
    res.status(401).json({ error: 'Invalid Firebase ID token' });
  }
}
