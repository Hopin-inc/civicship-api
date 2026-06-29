import express from 'express';
import { container } from 'tsyringe';
import NFTWalletUsecase from '@/application/domain/account/nft-wallet/usecase';
import { AuthorizationError, NotFoundError } from '@/errors/graphql';
import { apiKeyAuthMiddleware } from '@/presentation/middleware/api-key-auth';
import { requireApiKeyVendor } from '@/presentation/middleware/api-key-vendor';
import { validateFirebasePhoneAuth } from '@/presentation/middleware/firebase-phone-auth';
import {
  nftReadRateLimit,
  nftWebhookRateLimit,
  walletRateLimit,
} from '@/presentation/middleware/rate-limit';
import {
  MAX_LENGTHS,
  normalizeEvmAddress,
} from '@/presentation/router/utils/validation';
import { PrismaClientIssuer } from '@/infrastructure/prisma/client';
import logger from '@/infrastructure/logging';
import { IContext } from '@/types/server';

const router = express.Router();

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
    name,
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

router.post('/nft-wallets/link',
  walletRateLimit,
  apiKeyAuthMiddleware,
  requireApiKeyVendor,
  validateFirebasePhoneAuth,
  async (req, res) => {
    try {
      const vendor = res.locals.apiKey?.vendor;
      if (!vendor) {
        return res.status(403).json({ error: 'API key is not associated with a vendor' });
      }

      const user = res.locals.user;
      if (!user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const issuer = new PrismaClientIssuer();
      const ctx = { issuer } as IContext;
      const nftWalletUsecase = container.resolve(NFTWalletUsecase);

      const result = await nftWalletUsecase.linkVendorUser(ctx, vendor, user.id);

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Vendor user link error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post('/nft-wallets/by-ref',
  nftWebhookRateLimit,
  apiKeyAuthMiddleware,
  requireApiKeyVendor,
  async (req, res) => {
    try {
      const vendor = res.locals.apiKey?.vendor;
      if (!vendor) {
        return res.status(403).json({ error: 'API key is not associated with a vendor' });
      }

      const { walletRef, walletAddress, name } = (req.body ?? {}) as {
        walletRef?: unknown;
        walletAddress?: unknown;
        name?: unknown;
      };

      if (
        typeof walletRef !== 'string' ||
        walletRef.length === 0 ||
        walletRef.length > MAX_LENGTHS.WALLET_REF
      ) {
        return res.status(400).json({ error: 'walletRef is required (max 128 characters)' });
      }
      if (typeof walletAddress !== 'string' || !ETH_ADDRESS_PATTERN.test(walletAddress)) {
        return res
          .status(400)
          .json({ error: 'walletAddress is required and must be a valid address' });
      }
      if (
        name !== undefined &&
        (typeof name !== 'string' || name.length > MAX_LENGTHS.NAME)
      ) {
        return res.status(400).json({ error: `name must be a string up to ${MAX_LENGTHS.NAME} characters` });
      }

      const issuer = new PrismaClientIssuer();
      const ctx = { issuer } as IContext;
      const nftWalletUsecase = container.resolve(NFTWalletUsecase);

      const result = await nftWalletUsecase.registerWalletByRef(
        ctx,
        vendor,
        walletRef,
        normalizeEvmAddress(walletAddress),
        name,
      );

      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message, entity: error.entityName });
      }
      if (error instanceof AuthorizationError) {
        return res.status(403).json({ error: error.message });
      }
      logger.error('Wallet registration by ref error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
