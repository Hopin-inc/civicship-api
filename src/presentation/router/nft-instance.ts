import express from "express";
import { container } from "tsyringe";
import NftInstanceUseCase from "@/application/domain/account/nft-instance/usecase";
import { UpsertInstanceInput } from "@/application/domain/account/nft-instance/service";
import { AuthorizationError, NotFoundError } from "@/errors/graphql";
import { apiKeyAuthMiddleware } from "@/presentation/middleware/api-key-auth";
import { requireApiKeyVendor } from "@/presentation/middleware/api-key-vendor";
import {
  nftReadRateLimit,
  nftWebhookRateLimit,
} from "@/presentation/middleware/rate-limit";
import {
  EVM_ADDRESS_PATTERN,
  isValidHttpsUrl,
  normalizeEvmAddress,
} from "@/presentation/router/utils/validation";
import { instanceExplorerUrl } from "@/presentation/router/utils/explorer";
import { PrismaNftInstance } from "@/application/domain/account/nft-instance/data/type";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";
import { IContext } from "@/types/server";

const router = express.Router();

const INSTANCE_ID_PATTERN = /^\d+$/;

const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || typeof value === "string";

router.put(
  "/nft-tokens/:tokenAddress/instances/:instanceId",
  nftWebhookRateLimit,
  apiKeyAuthMiddleware,
  requireApiKeyVendor,
  async (req, res) => {
    try {
      const { instanceId } = req.params;
      const vendor = res.locals.apiKey?.vendor;
      if (!vendor) {
        return res.status(403).json({ error: "API key is not associated with a vendor" });
      }

      if (!EVM_ADDRESS_PATTERN.test(req.params.tokenAddress)) {
        return res.status(400).json({ error: "Invalid contract address format" });
      }
      const tokenAddress = normalizeEvmAddress(req.params.tokenAddress);

      if (!INSTANCE_ID_PATTERN.test(instanceId)) {
        return res.status(400).json({ error: "Invalid instance id format" });
      }

      const body = (req.body ?? {}) as Record<string, unknown>;

      if (
        typeof body.ownerWalletAddress !== "string" ||
        !EVM_ADDRESS_PATTERN.test(body.ownerWalletAddress)
      ) {
        return res
          .status(400)
          .json({ error: "ownerWalletAddress is required and must be a valid address" });
      }
      const ownerWalletAddress = normalizeEvmAddress(body.ownerWalletAddress);

      if (
        !isOptionalString(body.name) ||
        !isOptionalString(body.description) ||
        !isOptionalString(body.imageUrl)
      ) {
        return res.status(400).json({ error: "Invalid field type" });
      }

      if (body.imageUrl !== undefined && !isValidHttpsUrl(body.imageUrl)) {
        return res.status(400).json({ error: "imageUrl must be a valid https URL" });
      }

      if (
        body.metadata !== undefined &&
        (typeof body.metadata !== "object" || body.metadata === null || Array.isArray(body.metadata))
      ) {
        return res.status(400).json({ error: "metadata must be an object" });
      }

      const input: UpsertInstanceInput = {
        ownerWalletAddress,
        name: body.name ?? null,
        description: body.description ?? null,
        imageUrl: body.imageUrl ?? null,
        metadata: body.metadata as Record<string, unknown> | undefined,
      };

      const issuer = new PrismaClientIssuer();
      const ctx = { issuer } as IContext;
      const usecase = container.resolve(NftInstanceUseCase);

      const result = await usecase.upsertByTokenAddressAndInstanceId(
        ctx,
        tokenAddress,
        instanceId,
        input,
        vendor,
      );

      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          error: error.message,
          entity: error.entityName,
        });
      }
      if (error instanceof AuthorizationError) {
        return res.status(403).json({ error: error.message });
      }

      logger.error("NFT instance upsert error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

const DEFAULT_INSTANCE_LIST_LIMIT = 50;
const MAX_INSTANCE_LIST_LIMIT = 200;

function toInstanceResponse(instance: PrismaNftInstance) {
  return {
    id: instance.id,
    instanceId: instance.instanceId,
    tokenAddress: instance.nftToken.address,
    nftTokenId: instance.nftTokenId,
    chain: instance.nftToken.chain,
    explorerUrl: instanceExplorerUrl(
      instance.nftToken.chain,
      instance.nftToken.address,
      instance.instanceId,
    ),
    ownerWalletAddress: instance.nftWallet?.walletAddress ?? null,
    nftWalletId: instance.nftWalletId,
    name: instance.name,
    description: instance.description,
    imageUrl: instance.imageUrl,
    json: instance.json,
    status: instance.status,
    communityId: instance.communityId,
    createdAt: instance.createdAt,
    updatedAt: instance.updatedAt,
  };
}

router.get(
  "/nft-tokens/:tokenAddress/instances",
  nftReadRateLimit,
  apiKeyAuthMiddleware,
  async (req, res) => {
    try {
      if (!EVM_ADDRESS_PATTERN.test(req.params.tokenAddress)) {
        return res.status(400).json({ error: "Invalid contract address format" });
      }
      const tokenAddress = normalizeEvmAddress(req.params.tokenAddress);

      const limitParam = typeof req.query.limit === "string" ? Number(req.query.limit) : Number.NaN;
      const limit = Number.isFinite(limitParam)
        ? Math.min(Math.max(Math.floor(limitParam), 1), MAX_INSTANCE_LIST_LIMIT)
        : DEFAULT_INSTANCE_LIST_LIMIT;

      const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;

      const issuer = new PrismaClientIssuer();
      const ctx = { issuer } as IContext;
      const usecase = container.resolve(NftInstanceUseCase);

      const rows = await usecase.listByTokenAddress(ctx, tokenAddress, limit + 1, cursor);

      const hasNext = rows.length > limit;
      const items = rows.slice(0, limit).map(toInstanceResponse);

      const nextCursor = hasNext ? items[items.length - 1]?.id ?? null : null;

      return res.status(200).json({ items, nextCursor, hasNext });
    } catch (error) {
      logger.error("NFT instance list error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get(
  "/nft-tokens/:tokenAddress/instances/:instanceId",
  nftReadRateLimit,
  apiKeyAuthMiddleware,
  async (req, res) => {
    try {
      const { instanceId } = req.params;

      if (!EVM_ADDRESS_PATTERN.test(req.params.tokenAddress)) {
        return res.status(400).json({ error: "Invalid contract address format" });
      }
      const tokenAddress = normalizeEvmAddress(req.params.tokenAddress);

      if (!INSTANCE_ID_PATTERN.test(instanceId)) {
        return res.status(400).json({ error: "Invalid instance id format" });
      }

      const issuer = new PrismaClientIssuer();
      const ctx = { issuer } as IContext;
      const usecase = container.resolve(NftInstanceUseCase);

      const instance = await usecase.getByTokenAddressAndInstanceId(
        ctx,
        tokenAddress,
        instanceId,
      );

      if (!instance) {
        return res.status(404).json({
          error: `NftInstance not found (tokenAddress: ${tokenAddress}, instanceId: ${instanceId})`,
          entity: "NftInstance",
        });
      }

      return res.status(200).json(toInstanceResponse(instance));
    } catch (error) {
      logger.error("NFT instance read error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
