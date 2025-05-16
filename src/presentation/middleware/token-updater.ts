import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import IdentityService from '@/application/domain/account/identity/service';
import logger from '@/infrastructure/logging';

/**
 * Middleware to extract and update authentication tokens from requests
 */
export function tokenUpdaterMiddleware(req: Request, res: Response, next: NextFunction) {
  const idToken = req.headers.authorization?.replace(/^Bearer\s+/, "");
  const refreshToken = req.headers['x-refresh-token'] as string || '';
  const tokenExpiresAt = req.headers['x-token-expires-at'] as string || '';
  const phoneAuthToken = req.headers['x-phone-auth-token'] as string || '';
  const phoneRefreshToken = req.headers['x-phone-refresh-token'] as string || '';
  
  if (!idToken && !phoneAuthToken) {
    return next();
  }
  
  res.on('finish', async () => {
    try {
      const uid = (req as any).context?.uid;
      const phoneUid = (req as any).context?.phoneUid;
      
      if (uid) {
        const identityService = container.resolve(IdentityService);
        
        if (idToken) {
          let expiryTime = new Date();
          if (tokenExpiresAt) {
            try {
              expiryTime = new Date(tokenExpiresAt);
            } catch (parseError) {
              logger.debug('Could not parse token expiry from header, trying to extract from token');
              try {
                const tokenData = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
                if (tokenData.exp) {
                  expiryTime = new Date(tokenData.exp * 1000);
                } else {
                  expiryTime.setHours(expiryTime.getHours() + 1);
                }
              } catch (tokenParseError) {
                expiryTime.setHours(expiryTime.getHours() + 1);
                logger.debug('Could not parse token expiry, using default');
              }
            }
            
            await identityService.storeAuthTokens(uid, idToken, refreshToken, expiryTime);
            logger.debug(`Updated LINE auth token for user ${uid}, expires at ${expiryTime.toISOString()}`);
          }
        }
        
        if (phoneAuthToken && phoneUid) {
          let phoneExpiryTime = new Date();
          phoneExpiryTime.setHours(phoneExpiryTime.getHours() + 1); // Default expiry
          
          try {
            const tokenData = JSON.parse(Buffer.from(phoneAuthToken.split('.')[1], 'base64').toString());
            if (tokenData.exp) {
              phoneExpiryTime = new Date(tokenData.exp * 1000);
            }
          } catch (parseError) {
            logger.debug('Could not parse phone token expiry, using default');
          }
          
          await identityService.storeAuthTokens(phoneUid, phoneAuthToken, phoneRefreshToken, phoneExpiryTime);
          logger.debug(`Updated phone auth token for user ${phoneUid}, expires at ${phoneExpiryTime.toISOString()}`);
        }
      }
    } catch (error) {
      logger.error('Failed to update auth tokens:', error);
    }
  });
  
  next();
}
