import express from 'express';
import { container } from 'tsyringe';
import NFTWalletService from '@/application/domain/account/nft-wallet/service';
import { apiKeyAuthMiddleware } from '@/presentation/middleware/api-key-auth';
import { validateFirebasePhoneAuth } from '@/presentation/middleware/firebase-phone-auth';
import { walletRateLimit } from '@/presentation/middleware/rate-limit';
import { PrismaClientIssuer } from '@/infrastructure/prisma/client';
import logger from '@/infrastructure/logging';

const router = express();

router.post('/nft-wallets', 
  walletRateLimit,
  apiKeyAuthMiddleware,
  validateFirebasePhoneAuth,
  async (req, res) => {
    try {
      const { walletAddress } = req.body;
      const user = (req as any).user;
      
      if (!walletAddress) {
        return res.status(400).json({ error: 'walletAddress is required' });
      }
      
      if (typeof walletAddress !== 'string') {
        return res.status(400).json({ error: 'walletAddress must be a string' });
      }
      
      const issuer = new PrismaClientIssuer();
      const nftWalletService = container.resolve(NFTWalletService);
      
      await issuer.public({} as any, async (tx) => {
        await nftWalletService.createOrUpdateWalletAddress({} as any, user.id, walletAddress, tx);
      });
      
      logger.info(`Updated wallet address for user ${user.id}`);
      return res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Wallet address update error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
