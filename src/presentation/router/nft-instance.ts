import express from "express";
import { container } from "tsyringe";
import NftInstanceUseCase from "@/application/domain/account/nft-instance/usecase";
import { UpsertInstanceInput } from "@/application/domain/account/nft-instance/service";
import { NotFoundError } from "@/errors/graphql";
import { apiKeyAuthMiddleware } from "@/presentation/middleware/api-key-auth";
import { nftInstanceSyncRateLimit } from "@/presentation/middleware/rate-limit";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";
import { IContext } from "@/types/server";

const router = express();

const ETH_ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;
const INSTANCE_ID_PATTERN = /^[0-9]+$/;

const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || typeof value === "string";

router.put(
  "/nft-tokens/:tokenAddress/instances/:instanceId",
  nftInstanceSyncRateLimit,
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

      const body = (req.body ?? {}) as Record<string, unknown>;

      if (
        typeof body.ownerWalletAddress !== "string" ||
        !ETH_ADDRESS_PATTERN.test(body.ownerWalletAddress)
      ) {
        return res
          .status(400)
          .json({ error: "ownerWalletAddress is required and must be a valid address" });
      }

      if (
        !isOptionalString(body.name) ||
        !isOptionalString(body.description) ||
        !isOptionalString(body.imageUrl)
      ) {
        return res.status(400).json({ error: "Invalid field type" });
      }

      if (
        body.metadata !== undefined &&
        (typeof body.metadata !== "object" || body.metadata === null || Array.isArray(body.metadata))
      ) {
        return res.status(400).json({ error: "metadata must be an object" });
      }

      const input: UpsertInstanceInput = {
        ownerWalletAddress: body.ownerWalletAddress,
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
      );

      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          error: error.message,
          entity: error.entityName,
        });
      }

      logger.error("NFT instance upsert error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
