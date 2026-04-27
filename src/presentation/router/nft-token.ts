import express from "express";
import { container } from "tsyringe";
import NftTokenUseCase from "@/application/domain/account/nft-token/usecase";
import { apiKeyAuthMiddleware } from "@/presentation/middleware/api-key-auth";
import { nftTokenSyncRateLimit } from "@/presentation/middleware/rate-limit";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";
import { IContext } from "@/types/server";
import { isUpstreamHttpError, isUpstreamTimeout } from "@/presentation/router/utils/error";

const router = express();

const ETH_ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

router.put(
  "/nft-tokens/:address",
  nftTokenSyncRateLimit,
  apiKeyAuthMiddleware,
  async (req, res) => {
    try {
      const { address } = req.params;

      if (!ETH_ADDRESS_PATTERN.test(address)) {
        return res.status(400).json({ error: "Invalid contract address format" });
      }

      const issuer = new PrismaClientIssuer();
      const ctx = { issuer } as IContext;
      const usecase = container.resolve(NftTokenUseCase);

      const result = await usecase.syncByAddress(ctx, address);

      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      if (isUpstreamTimeout(error)) {
        logger.warn("NFT token sync timeout:", error);
        return res.status(504).json({ error: "Upstream timeout" });
      }

      if (isUpstreamHttpError(error)) {
        logger.error("NFT token sync upstream error:", error);
        return res.status(502).json({ error: "Failed to sync NFT token" });
      }

      logger.error("NFT token sync error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
