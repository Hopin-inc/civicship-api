import express from 'express';
import { container } from 'tsyringe';
import NFTWalletUsecase from '@/application/domain/account/nft-wallet/usecase';
import { apiKeyAuthMiddleware } from '@/presentation/middleware/api-key-auth';
import { validateFirebasePhoneAuth } from '@/presentation/middleware/firebase-phone-auth';
import { nftReadRateLimit, walletRateLimit } from '@/presentation/middleware/rate-limit';
import { PrismaClientIssuer } from '@/infrastructure/prisma/client';
import logger from '@/infrastructure/logging';
import { IContext } from '@/types/server';

const router = express();

const ETH_ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

async function handleRegister(
  req: express.Request,
  res: express.Response,
  walletAddress: string,
  name: unknown,
) {
  const user = res.locals.user as { id: string; name: string } | undefined;
  if (!user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (name !== undefined && typeof name !== 'string') {
    return res.status(400).json({ error: 'name must be a string' });
  }

  const issuer = new PrismaClientIssuer();
  const nftWalletUsecase = container.resolve(NFTWalletUsecase);
  const ctx = { issuer } as IContext;

  const wallet = await nftWalletUsecase.registerWallet(
    ctx,
    user.id,
    walletAddress,
    name as string | undefined,
    user.name,
  );

  return res.status(200).json({ success: true, walletId: wallet.id });
}

router.post('/nft-wallets',
  walletRateLimit,
  apiKeyAuthMiddleware,
  validateFirebasePhoneAuth,
  async (req, res) => {
    try {
      const { walletAddress, name } = req.body;

      if (!walletAddress || typeof walletAddress !== 'string') {
        return res.status(400).json({ error: 'walletAddress must be a string' });
      }

      return await handleRegister(req, res, walletAddress, name);
    } catch (error) {
      logger.error('Wallet registration error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.put('/nft-wallets/:walletAddress',
  walletRateLimit,
  apiKeyAuthMiddleware,
  validateFirebasePhoneAuth,
  async (req, res) => {
    try {
      const { walletAddress } = req.params;

      if (!ETH_ADDRESS_PATTERN.test(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address format' });
      }

      const { name } = (req.body ?? {}) as { name?: unknown };

      return await handleRegister(req, res, walletAddress, name);
    } catch (error) {
      logger.error('Wallet registration error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get('/nft-wallets/:walletAddress',
  nftReadRateLimit,
  apiKeyAuthMiddleware,
  async (req, res) => {
    try {
      const { walletAddress } = req.params;

      if (!ETH_ADDRESS_PATTERN.test(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address format' });
      }

      const issuer = new PrismaClientIssuer();
      const nftWalletUsecase = container.resolve(NFTWalletUsecase);
      const ctx = { issuer } as IContext;

      const wallet = await nftWalletUsecase.getByWalletAddress(ctx, walletAddress);

      if (!wallet) {
        return res.status(404).json({
          error: `NftWallet not found (walletAddress: ${walletAddress})`,
          entity: 'NftWallet',
        });
      }

      return res.status(200).json({
        id: wallet.id,
        walletAddress: wallet.walletAddress,
        userId: wallet.userId,
        type: wallet.type,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      });
    } catch (error) {
      logger.error('Wallet read error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
