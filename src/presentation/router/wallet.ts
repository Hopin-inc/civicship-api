import express from 'express';
import { container } from 'tsyringe';
import NFTWalletService from '@/application/domain/account/nft-wallet/service';
import { apiKeyAuthMiddleware } from '@/presentation/middleware/api-key-auth';
import { validateFirebasePhoneAuth } from '@/presentation/middleware/firebase-phone-auth';
import { walletRateLimit } from '@/presentation/middleware/rate-limit';
import { PrismaClientIssuer } from '@/infrastructure/prisma/client';
import logger from '@/infrastructure/logging';
import { IContext } from '@/types/server';
import { PrismaAuthUser } from '@/application/domain/account/user/data/type';
import { PrismaNftWalletCreateDetail } from '@/application/domain/account/nft-wallet/data/type';

const router = express();

router.post('/nft-wallets', 
  walletRateLimit,
  apiKeyAuthMiddleware,
  validateFirebasePhoneAuth,
  async (req, res) => {
    try {
      const { walletAddress, name } = req.body;
      const user = (req as any).user as PrismaAuthUser;
      
      if (!walletAddress) {
        return res.status(400).json({ error: 'walletAddress is required' });
      }
      
      if (typeof walletAddress !== 'string') {
        return res.status(400).json({ error: 'walletAddress must be a string' });
      }

      if (name !== undefined && typeof name !== 'string') {
        return res.status(400).json({ error: 'name must be a string' });
      }
      
      const issuer = new PrismaClientIssuer();
      const nftWalletService = container.resolve(NFTWalletService);
      const ctx = { issuer } as IContext;
      
      let walletRecord: PrismaNftWalletCreateDetail | undefined;
      await issuer.public(ctx, async (tx) => {
        walletRecord = await nftWalletService.createOrUpdateWalletAddress(ctx, user.id, walletAddress, tx);
        
        if (name && user.name === "名前未設定") {
          await tx.user.update({
            where: { id: user.id },
            data: { name },
          });
          logger.info(`Updated user name for user ${user.id}: ${name}`);
        }
      });
      
      logger.info(`Updated wallet address for user ${user.id}`);
      
      if (walletRecord) {
        issuer.internal(async (tx) => {
          const result = await nftWalletService.storeMetadata(
            ctx, 
            { id: walletRecord!.id, walletAddress: walletRecord!.walletAddress }, 
            tx
          );
          if (result.success) {
            logger.info(`NFT metadata processed for wallet ${walletAddress}: ${result.itemsProcessed} items`);
          } else {
            logger.warn(`NFT metadata processing failed for wallet ${walletAddress}: ${result.error}`);
          }
        }).catch(error => {
          logger.error(`NFT metadata processing error for wallet ${walletAddress}:`, error);
        });
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Wallet address update error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
