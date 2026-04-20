import express, { Request } from 'express';
import { container } from 'tsyringe';
import NFTWalletUsecase from '@/application/domain/account/nft-wallet/usecase';
import { apiKeyAuthMiddleware } from '@/presentation/middleware/api-key-auth';
import { validateFirebasePhoneAuth } from '@/presentation/middleware/firebase-phone-auth';
import { walletRateLimit } from '@/presentation/middleware/rate-limit';
import { PrismaClientIssuer } from '@/infrastructure/prisma/client';
import logger from '@/infrastructure/logging';
import { IContext } from '@/types/server';
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

      const issuer = new PrismaClientIssuer();
      const ctx = { issuer } as IContext;
      const nftWalletUsecase = container.resolve(NFTWalletUsecase);
      const result = await nftWalletUsecase.syncNfts(ctx, user.id, walletAddress, nfts);

      if (result.success) {
        return res.status(200).json({ success: true, processed: result.processed });
      }

      if (result.code === "INVALID_PAYLOAD") {
        return res.status(400).json({ error: "Invalid payload", errors: result.errors });
      }

      // WALLET_FOREIGN
      return res.status(403).json({ error: "Wallet is linked to another user" });
    } catch (error) {
      logger.error('NFT sync error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
