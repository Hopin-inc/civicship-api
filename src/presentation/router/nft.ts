import express, { Request } from 'express';
import { container } from 'tsyringe';
import NFTWalletUsecase from '@/application/domain/account/nft-wallet/usecase';
import { apiKeyAuthMiddleware } from '@/presentation/middleware/api-key-auth';
import { validateFirebasePhoneAuth } from '@/presentation/middleware/firebase-phone-auth';
import { walletRateLimit } from '@/presentation/middleware/rate-limit';
import logger from '@/infrastructure/logging';
import { PrismaAuthUser } from '@/application/domain/account/user/data/type';

type AuthedRequest = Request & { user: PrismaAuthUser };

const router = express();

router.post('/nfts/sync',
  walletRateLimit,
  apiKeyAuthMiddleware,
  validateFirebasePhoneAuth,
  async (req, res) => {
    try {
      const { walletAddress, nfts } = req.body;
      const { user } = req as AuthedRequest;

      if (!walletAddress || typeof walletAddress !== 'string') {
        return res.status(400).json({ error: 'walletAddress must be a string' });
      }

      const nftWalletUsecase = container.resolve(NFTWalletUsecase);
      nftWalletUsecase.dryRunSyncNfts(user.id, walletAddress, nfts);

      return res.status(202).json({ success: true });
    } catch (error) {
      logger.error('NFT sync error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
