import express from "express";
import { container } from "tsyringe";
import { NftChain } from "@prisma/client";
import NftTokenUseCase from "@/application/domain/account/nft-token/usecase";
import { UpsertTokenInput } from "@/application/domain/account/nft-token/service";
import { AuthorizationError, ValidationError } from "@/errors/graphql";
import { apiKeyAuthMiddleware } from "@/presentation/middleware/api-key-auth";
import { requireApiKeyVendor } from "@/presentation/middleware/api-key-vendor";
import { nftReadRateLimit, nftTokenSyncRateLimit } from "@/presentation/middleware/rate-limit";
import {
  EVM_ADDRESS_PATTERN,
  MAX_LENGTHS,
  findOversizedField,
  isOptionalStringOrNull,
  isValidHttpsUrl,
  normalizeEvmAddress,
} from "@/presentation/router/utils/validation";
import { tokenExplorerUrl } from "@/presentation/router/utils/explorer";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";
import { IContext } from "@/types/server";

const router = express.Router();

const NFT_CHAIN_VALUES = Object.values(NftChain);

router.put(
  "/nft-tokens/:address",
  nftTokenSyncRateLimit,
  apiKeyAuthMiddleware,
  requireApiKeyVendor,
  async (req, res) => {
    try {
      const vendor = res.locals.apiKey?.vendor;
      if (!vendor) {
        return res.status(403).json({ error: "API key is not associated with a vendor" });
      }

      if (!EVM_ADDRESS_PATTERN.test(req.params.address)) {
        return res.status(400).json({ error: "Invalid contract address format" });
      }
      const address = normalizeEvmAddress(req.params.address);

      const body = (req.body ?? {}) as Record<string, unknown>;

      if (typeof body.type !== "string" || body.type.length === 0) {
        return res.status(400).json({ error: "type is required" });
      }

      if (typeof body.chain !== "string" || !NFT_CHAIN_VALUES.includes(body.chain as NftChain)) {
        return res.status(400).json({
          error: `chain is required and must be one of: ${NFT_CHAIN_VALUES.join(", ")}`,
        });
      }

      if (
        !isOptionalStringOrNull(body.name) ||
        !isOptionalStringOrNull(body.symbol) ||
        !isOptionalStringOrNull(body.decimals) ||
        !isOptionalStringOrNull(body.totalSupply) ||
        !isOptionalStringOrNull(body.holders) ||
        !isOptionalStringOrNull(body.exchangeRate) ||
        !isOptionalStringOrNull(body.circulatingMarketCap) ||
        !isOptionalStringOrNull(body.iconUrl)
      ) {
        return res.status(400).json({ error: "Invalid field type" });
      }

      const oversized = findOversizedField(body, {
        type: MAX_LENGTHS.TYPE,
        name: MAX_LENGTHS.NAME,
        symbol: MAX_LENGTHS.SYMBOL,
        decimals: MAX_LENGTHS.NUMERIC_STRING,
        totalSupply: MAX_LENGTHS.NUMERIC_STRING,
        holders: MAX_LENGTHS.NUMERIC_STRING,
        exchangeRate: MAX_LENGTHS.NUMERIC_STRING,
        circulatingMarketCap: MAX_LENGTHS.NUMERIC_STRING,
        iconUrl: MAX_LENGTHS.URL,
      });
      if (oversized) {
        return res.status(400).json({ error: oversized });
      }

      if (typeof body.iconUrl === "string" && !isValidHttpsUrl(body.iconUrl)) {
        return res.status(400).json({ error: "iconUrl must be a valid https URL" });
      }

      if (
        body.metadata !== undefined &&
        body.metadata !== null &&
        (typeof body.metadata !== "object" || Array.isArray(body.metadata))
      ) {
        return res.status(400).json({ error: "metadata must be an object" });
      }

      // 正規化方針 (UpsertTokenInput の型定義に揃える):
      //   - name / symbol: string | null → null は保持 (DB に NULL 反映)
      //   - decimals / totalSupply / holders / exchangeRate /
      //     circulatingMarketCap / iconUrl: string | undefined → null は
      //     undefined に潰す (= 更新しない)
      //   - metadata: object | undefined → null/undefined は更新しない
      const input: UpsertTokenInput = {
        type: body.type,
        chain: body.chain as NftChain,
        name: body.name ?? null,
        symbol: body.symbol ?? null,
        decimals: body.decimals ?? undefined,
        totalSupply: body.totalSupply ?? undefined,
        holders: body.holders ?? undefined,
        exchangeRate: body.exchangeRate ?? undefined,
        circulatingMarketCap: body.circulatingMarketCap ?? undefined,
        iconUrl: body.iconUrl ?? undefined,
        metadata:
          body.metadata == null
            ? undefined
            : (body.metadata as Record<string, unknown>),
      };

      const issuer = new PrismaClientIssuer();
      const ctx = { issuer } as IContext;
      const usecase = container.resolve(NftTokenUseCase);

      const result = await usecase.upsertByAddress(ctx, address, input, vendor);

      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return res.status(403).json({ error: error.message });
      }
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error("NFT token upsert error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get(
  "/nft-tokens/:address",
  nftReadRateLimit,
  apiKeyAuthMiddleware,
  async (req, res) => {
    try {
      if (!EVM_ADDRESS_PATTERN.test(req.params.address)) {
        return res.status(400).json({ error: "Invalid contract address format" });
      }
      const address = normalizeEvmAddress(req.params.address);

      const issuer = new PrismaClientIssuer();
      const ctx = { issuer } as IContext;
      const usecase = container.resolve(NftTokenUseCase);

      const token = await usecase.getByAddress(ctx, address);

      if (!token) {
        return res.status(404).json({
          error: `NftToken not found (address: ${address})`,
          entity: "NftToken",
        });
      }

      return res.status(200).json({
        ...token,
        explorerUrl: tokenExplorerUrl(token.chain, token.address),
      });
    } catch (error) {
      logger.error("NFT token read error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
