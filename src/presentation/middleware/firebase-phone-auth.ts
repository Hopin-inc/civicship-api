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
    const tenantId = process.env.FIREBASE_AUTH_TENANT_ID;
    if (!tenantId) {
      throw new Error("FIREBASE_AUTH_TENANT_ID not defined.");
    }

    const tenantedAuth = auth.tenantManager().authForTenant(tenantId);
    const decoded = await tenantedAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const issuer = new PrismaClientIssuer();
    const user = await issuer.internal(async (tx) =>
      tx.user.findFirst({
        where: { identities: { some: { uid } } }
      })
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    (req as any).user = user;
    (req as any).uid = uid;
    next();
  } catch (error) {
    logger.error('Firebase phone auth validation error:', error);
    res.status(401).json({ error: 'Invalid Firebase ID token' });
  }
}
