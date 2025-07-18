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
  const phoneTokenExpiresAt = req.headers['x-phone-token-expires-at'] as string || '';
  const phoneUid = req.headers['x-phone-uid'] as string || '';

  if (!idToken) {
    return next();
  }

  res.on('finish', async () => {
    try {
      const uid = req.context?.uid as string | undefined;
      const contextPhoneUid = req.context?.phoneUid as string | undefined;
      const effectivePhoneUid = contextPhoneUid || phoneUid;

      if (uid) {
        const identityService = container.resolve(IdentityService);

        if (idToken && refreshToken) {
          let expiryTime = new Date();
          if (tokenExpiresAt) {
            try {
              expiryTime = new Date(parseInt(tokenExpiresAt, 10) * 1000);
            } catch {
              logger.debug('Could not parse token expiry from header, trying to extract from token');
              try {
                const tokenData = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
                if (tokenData.exp) {
                  expiryTime = new Date(tokenData.exp * 1000);
                } else {
                  expiryTime.setHours(expiryTime.getHours() + 1);
                }
              } catch {
                expiryTime.setHours(expiryTime.getHours() + 1);
                logger.debug('Could not parse token expiry, using default');
              }
            }
          } else {
            try {
              const tokenData = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
              if (tokenData.exp) {
                expiryTime = new Date(tokenData.exp * 1000);
              } else {
                expiryTime.setHours(expiryTime.getHours() + 1);
              }
            } catch {
              expiryTime.setHours(expiryTime.getHours() + 1);
              logger.debug('Could not parse token expiry, using default');
            }
          }

          await identityService.storeAuthTokens(uid, idToken, refreshToken, expiryTime);
          logger.debug(`Updated LINE auth token for user ${uid}, expires at ${expiryTime.toISOString()}`);
        } else if (idToken) {
          logger.debug(`Skipping LINE token update for user ${uid} - refresh token not provided`);
        }

        if (phoneAuthToken && phoneRefreshToken && effectivePhoneUid) {
          let phoneExpiryTime = new Date();

          if (phoneTokenExpiresAt) {
            try {
              phoneExpiryTime = new Date(parseInt(phoneTokenExpiresAt, 10) * 1000);
              logger.debug(`Using phone token expiry from header: ${phoneExpiryTime.toISOString()}`);
            } catch {
              logger.debug('Could not parse phone token expiry from header, falling back to token data');
            }
          }

          if (!phoneTokenExpiresAt || isNaN(phoneExpiryTime.getTime())) {
            try {
              const tokenData = JSON.parse(Buffer.from(phoneAuthToken.split('.')[1], 'base64').toString());
              if (tokenData.exp) {
                phoneExpiryTime = new Date(tokenData.exp * 1000);
              } else {
                phoneExpiryTime.setHours(phoneExpiryTime.getHours() + 1); // Default expiry
              }
            } catch {
              logger.debug('Could not parse phone token expiry, using default');
            }
          }

          await identityService.storeAuthTokens(effectivePhoneUid, phoneAuthToken, phoneRefreshToken, phoneExpiryTime);
          logger.debug(`Updated phone auth token for user ${effectivePhoneUid}, expires at ${phoneExpiryTime.toISOString()}`);
        }
      }
    } catch (error) {
      logger.error('Failed to update auth tokens:', error);
    }
  });

  next();
}
