import express from "express";
import { container } from "tsyringe";
import NftTokenUseCase from "@/application/domain/account/nft-token/usecase";
import { UpsertTokenInput } from "@/application/domain/account/nft-token/service";
import { apiKeyAuthMiddleware } from "@/presentation/middleware/api-key-auth";
import { nftTokenSyncRateLimit } from "@/presentation/middleware/rate-limit";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";
import { IContext } from "@/types/server";

const router = express();

const ETH_ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || typeof value === "string";

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

      const body = (req.body ?? {}) as Record<string, unknown>;

      if (typeof body.type !== "string" || body.type.length === 0) {
        return res.status(400).json({ error: "type is required" });
      }

      if (
        !isOptionalString(body.name) ||
        !isOptionalString(body.symbol) ||
        !isOptionalString(body.decimals) ||
        !isOptionalString(body.totalSupply) ||
        !isOptionalString(body.holders) ||
        !isOptionalString(body.exchangeRate) ||
        !isOptionalString(body.circulatingMarketCap) ||
        !isOptionalString(body.iconUrl)
      ) {
        return res.status(400).json({ error: "Invalid field type" });
      }

      if (
        body.metadata !== undefined &&
        (typeof body.metadata !== "object" || body.metadata === null || Array.isArray(body.metadata))
      ) {
        return res.status(400).json({ error: "metadata must be an object" });
      }

      const input: UpsertTokenInput = {
        type: body.type,
        name: body.name ?? null,
        symbol: body.symbol ?? null,
        decimals: body.decimals,
        totalSupply: body.totalSupply,
        holders: body.holders,
        exchangeRate: body.exchangeRate,
        circulatingMarketCap: body.circulatingMarketCap,
        iconUrl: body.iconUrl,
        metadata: body.metadata as Record<string, unknown> | undefined,
      };

      const issuer = new PrismaClientIssuer();
      const ctx = { issuer } as IContext;
      const usecase = container.resolve(NftTokenUseCase);

      const result = await usecase.upsertByAddress(ctx, address, input);

      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      logger.error("NFT token upsert error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
