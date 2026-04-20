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
import type { SyncNftsResponse } from '@/presentation/router/nft.types';

type AuthedRequest = Request & { user: PrismaAuthUser };

const router = express();

router.post('/nfts/sync',
  walletRateLimit,
  apiKeyAuthMiddleware,
  validateFirebasePhoneAuth,
  async (req, res) => {
    try {
      const body = req.body as { walletAddress?: unknown; nfts?: unknown };
      const walletAddress = body.walletAddress;
      const nfts = body.nfts;
      const { user } = req as AuthedRequest;

      if (!walletAddress || typeof walletAddress !== 'string') {
        const response: SyncNftsResponse = { error: 'walletAddress must be a string' };
        return res.status(400).json(response);
      }

      const issuer = new PrismaClientIssuer();
      const ctx = { issuer } as IContext;
      const nftWalletUsecase = container.resolve(NFTWalletUsecase);
      const result = await nftWalletUsecase.syncNfts(ctx, user.id, walletAddress, nfts);

      if (result.success) {
        const response: SyncNftsResponse = { success: true, processed: result.processed };
        return res.status(200).json(response);
      }

      if (result.code === "INVALID_PAYLOAD") {
        const response: SyncNftsResponse = { error: "Invalid payload", errors: result.errors };
        return res.status(400).json(response);
      }

      // WALLET_FOREIGN
      const response: SyncNftsResponse = { error: "Wallet is linked to another user" };
      return res.status(403).json(response);
    } catch (error) {
      logger.error('NFT sync error:', error);
      const response: SyncNftsResponse = { error: 'Internal server error' };
      return res.status(500).json(response);
    }
  }
);

export default router;
