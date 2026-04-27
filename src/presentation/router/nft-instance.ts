import express from "express";
import { container } from "tsyringe";
import NftInstanceUseCase from "@/application/domain/account/nft-instance/usecase";
import { NotFoundError } from "@/errors/graphql";
import { apiKeyAuthMiddleware } from "@/presentation/middleware/api-key-auth";
import { nftSyncRateLimit } from "@/presentation/middleware/rate-limit";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";
import { IContext } from "@/types/server";
import { isUpstreamTimeout } from "@/presentation/router/utils/error";

const router = express();

const ETH_ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;
const INSTANCE_ID_PATTERN = /^[0-9]+$/;

router.put(
  "/nft-instances/:tokenAddress/:instanceId",
  nftSyncRateLimit,
  apiKeyAuthMiddleware,
  async (req, res) => {
    try {
      const { tokenAddress, instanceId } = req.params;

      if (!ETH_ADDRESS_PATTERN.test(tokenAddress)) {
        return res.status(400).json({ error: "Invalid contract address format" });
      }

      if (!INSTANCE_ID_PATTERN.test(instanceId)) {
        return res.status(400).json({ error: "Invalid instance id format" });
      }

      const issuer = new PrismaClientIssuer();
      const ctx = { issuer } as IContext;
      const usecase = container.resolve(NftInstanceUseCase);

      const result = await usecase.syncByTokenAddressAndInstanceId(ctx, tokenAddress, instanceId);

      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          error: error.message,
          entity: error.entityName,
        });
      }

      if (isUpstreamTimeout(error)) {
        logger.warn("NFT instance sync timeout:", error);
        return res.status(504).json({ error: "Upstream timeout" });
      }

      logger.error("NFT instance sync error:", error);
      return res.status(502).json({ error: "Failed to sync NFT instance" });
    }
  },
);

export default router;
