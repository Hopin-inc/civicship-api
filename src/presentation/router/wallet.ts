import express from 'express';
import { container } from 'tsyringe';
import NFTWalletUsecase from '@/application/domain/account/nft-wallet/usecase';
import { apiKeyAuthMiddleware } from '@/presentation/middleware/api-key-auth';
import { validateFirebasePhoneAuth } from '@/presentation/middleware/firebase-phone-auth';
import { walletRateLimit } from '@/presentation/middleware/rate-limit';
import { PrismaClientIssuer } from '@/infrastructure/prisma/client';
import logger from '@/infrastructure/logging';
import { IContext } from '@/types/server';
import { PrismaAuthUser } from '@/application/domain/account/user/data/type';
import { validateNftPayload } from '@/application/domain/account/nft-wallet/data/validator';

const router = express();

router.post('/nft-wallets', 
  walletRateLimit,
  apiKeyAuthMiddleware,
  validateFirebasePhoneAuth,
  async (req, res) => {
    try {
      const { walletAddress, name, nfts } = req.body;
      const user = (req as any).user as PrismaAuthUser;

      if (!walletAddress || typeof walletAddress !== 'string') {
        return res.status(400).json({ error: 'walletAddress must be a string' });
      }

      if (name !== undefined && typeof name !== 'string') {
        return res.status(400).json({ error: 'name must be a string' });
      }

      if (nfts !== undefined) {
        const result = validateNftPayload(nfts);
        if (result.valid) {
          logger.info("📨 [dry-run] NFT payload valid", {
            walletAddress,
            userId: user.id,
            nftCount: result.count,
            sampleItem: result.items[0],
          });
        } else {
          logger.warn("⚠️ [dry-run] NFT payload invalid", {
            walletAddress,
            userId: user.id,
            errors: result.errors,
          });
        }
      }

      const issuer = new PrismaClientIssuer();
      const nftWalletUsecase = container.resolve(NFTWalletUsecase);
      const ctx = { issuer } as IContext;
      
      const wallet = await nftWalletUsecase.registerWallet(
        ctx,
        user.id,
        walletAddress,
        name,
        user.name,
      );
      
      return res.status(200).json({ success: true, walletId: wallet.id });
    } catch (error) {
      logger.error('Wallet registration error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
