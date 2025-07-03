import { Request, Response, NextFunction } from 'express';
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";

export async function apiKeyAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    res.status(401).json({ error: 'API key is required' });
    return;
  }

  try {
    const issuer = new PrismaClientIssuer();
    const keyRecord = await issuer.internal(async (tx) =>
      tx.apiKey.findFirst({
        where: { key: apiKey, isActive: true }
      })
    );

    if (!keyRecord) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    (req as any).apiKey = keyRecord;
    next();
  } catch (error) {
    logger.error('API key validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
