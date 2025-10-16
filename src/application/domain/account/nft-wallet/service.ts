import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { injectable, inject } from "tsyringe";
import { fetchWithRetry } from "@/utils/retry";
import logger from "@/infrastructure/logging";
import NFTWalletRepository from "@/application/domain/account/nft-wallet/data/repository";
import NftTokenRepository from "@/application/domain/account/nft-token/data/repository";
import NftInstanceRepository from "@/application/domain/account/nft-instance/data/repository";
import { BaseSepoliaNftResponse, BaseSepoliaTokenResponse } from "@/types/external/baseSepolia";
import pLimit from "p-limit";

const TOKEN_CACHE_TTL = 24 * 60 * 60 * 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const TIMEOUT = 60000;

const isTokenCacheValid = (updatedAt: Date): boolean => {
  return Date.now() - updatedAt.getTime() < TOKEN_CACHE_TTL;
};

export type NftMetadataItem = {
  id: string;
  token: {
    address?: string;
    address_hash?: string;
    name?: string;
    symbol?: string;
    type?: string;
  };
  metadata: {
    name?: string;
    description?: string;
    image?: string;
  } | null;
};

export type NftMetadata = {
  items: NftMetadataItem[];
};

export type TokenFetchResult = {
  info: BaseSepoliaTokenResponse | null;
  success: boolean;
  error?: string;
};

@injectable()
export default class NFTWalletService {
  constructor(
    @inject("NFTWalletRepository") private nftWalletRepository: NFTWalletRepository,
    @inject("NftTokenRepository") private nftTokenRepository: NftTokenRepository,
    @inject("NftInstanceRepository") private nftInstanceRepository: NftInstanceRepository,
  ) {}
  async createOrUpdateWalletAddress(
    ctx: IContext,
    userId: string,
    walletAddress: string,
    tx: Prisma.TransactionClient,
  ) {
    return this.nftWalletRepository.upsertByUserId(ctx, userId, walletAddress, tx);
  }

  async fetchMetadata(walletAddress: string): Promise<NftMetadata> {
    const startTime = Date.now();
    try {
      const baseApiUrl =
        process.env.BASE_SEPOLIA_API_URL || "https://base-sepolia.blockscout.com/api/v2";
      const apiUrl = `${baseApiUrl}/addresses/${walletAddress}/nft`;

      logger.debug("🌐 Fetching NFT list from Blockscout", { walletAddress });
      const response = await fetchWithRetry<BaseSepoliaNftResponse>(
        apiUrl,
        MAX_RETRIES,
        RETRY_DELAY,
        TIMEOUT,
      );

      if (!response.items?.length) {
        logger.info("📭 No NFTs found", { 
          walletAddress, 
          durationMs: Date.now() - startTime 
        });
        return { items: [] };
      }

      logger.info("📥 Fetched NFTs from Blockscout", {
        walletAddress,
        nftCount: response.items.length,
        durationMs: Date.now() - startTime,
      });
      return response;
    } catch (error) {
      const errorDetails = {
        walletAddress,
        durationMs: Date.now() - startTime,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorCode: (error as any).code,
        errorType: (error as any).type,
        errorStack: error instanceof Error ? error.stack : undefined,
      };
      
      logger.error("❌ Failed to fetch NFT metadata", errorDetails);
      throw error;
    }
  }

  async fetchTokenInfos(
    ctx: IContext,
    metadata: NftMetadata,
  ): Promise<Record<string, TokenFetchResult>> {
    const startTime = Date.now();
    const baseApiUrl =
      process.env.BASE_SEPOLIA_API_URL || "https://base-sepolia.blockscout.com/api/v2";
    const result: Record<string, TokenFetchResult> = {};

    const uniqueAddresses = [
      ...new Set(
        metadata.items
          .map((item) => item.token.address ?? item.token.address_hash)
          .filter((address): address is string => !!address),
      ),
    ];

    if (uniqueAddresses.length === 0) {
      return result;
    }

    const existingTokens = await this.nftTokenRepository.findManyByAddresses(ctx, uniqueAddresses);
    const tokenMap = new Map(existingTokens.map((token) => [token.address, token]));

    const addressesToFetch: string[] = [];
    let cachedCount = 0;

    for (const address of uniqueAddresses) {
      const existingToken = tokenMap.get(address);

      if (existingToken && existingToken.updatedAt && isTokenCacheValid(existingToken.updatedAt)) {
        result[address] = {
          info: {
            address: existingToken.address,
            name: existingToken.name ?? undefined,
            symbol: existingToken.symbol ?? undefined,
            type: existingToken.type,
          },
          success: true,
        };
        cachedCount++;
        logger.debug("📦 Using cached token info", { tokenAddress: address });
      } else {
        addressesToFetch.push(address);
      }
    }

    const limit = pLimit(5);
    const fetchPromises = addressesToFetch.map((address) =>
      limit(async () => {
        try {
          const tokenApiUrl = `${baseApiUrl}/tokens/${address}`;
          logger.debug("🌐 Fetching token info", { tokenAddress: address });
          const info = await fetchWithRetry<BaseSepoliaTokenResponse>(
            tokenApiUrl,
            MAX_RETRIES,
            RETRY_DELAY,
            TIMEOUT,
          );
          logger.debug("📥 Fetched token info", { tokenAddress: address });
          return { 
            address, 
            result: {
              info,
              success: true,
            }
          };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          logger.warn("⚠️ Failed to fetch token info", {
            tokenAddress: address,
            error: errorMessage,
          });
          return { 
            address, 
            result: {
              info: null,
              success: false,
              error: errorMessage,
            }
          };
        }
      }),
    );

    const fetchedTokens = await Promise.all(fetchPromises);
    let fetchedCount = 0;
    let failedCount = 0;

    for (const { address, result: fetchResult } of fetchedTokens) {
      result[address] = fetchResult;
      if (fetchResult.success) {
        fetchedCount++;
      } else {
        failedCount++;
      }
    }

    logger.info("✅ Token info fetch completed", {
      totalTokens: uniqueAddresses.length,
      cachedCount,
      fetchedCount,
      failedCount,
      concurrentLimit: 5,
      durationMs: Date.now() - startTime,
    });

    return result;
  }

  async persistMetadata(
    ctx: IContext,
    wallet: { id: string; walletAddress: string },
    metadata: NftMetadata,
    tokenInfos: Record<string, TokenFetchResult>,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const startTime = Date.now();
    let processedCount = 0;
    let skippedCount = 0;

    for (const item of metadata.items) {
      const tokenAddress = item.token.address ?? item.token.address_hash;
      if (!tokenAddress) {
        skippedCount++;
        logger.warn("⚠️ Missing token address, skipping NFT", { 
          instanceId: item.id,
          walletAddress: wallet.walletAddress,
        });
        continue;
      }

      if (!item.metadata) {
        skippedCount++;
        logger.warn("⚠️ Missing metadata, skipping NFT", { 
          instanceId: item.id,
          tokenAddress,
          walletAddress: wallet.walletAddress,
        });
        continue;
      }

      const tokenFetchResult = tokenInfos[tokenAddress];
      const tokenInfo = tokenFetchResult?.info;
      const tokenName = tokenInfo?.name || item.token.name;
      const tokenSymbol = tokenInfo?.symbol || item.token.symbol;
      const tokenType = tokenInfo?.type || item.token.type || "UNKNOWN";

      const nftToken = await this.nftTokenRepository.upsert(
        ctx,
        {
          address: tokenAddress,
          name: tokenName || null,
          symbol: tokenSymbol || null,
          type: tokenType,
          json: tokenInfo || item.token,
        },
        tx,
      );

      await this.nftInstanceRepository.upsert(
        ctx,
        {
          instanceId: item.id,
          name: item.metadata.name || null,
          description: item.metadata.description || null,
          imageUrl: item.metadata.image || null,
          json: item,
          nftWalletId: wallet.id,
          nftTokenId: nftToken.id,
        },
        tx,
      );

      processedCount++;
    }

    logger.info("✅ NFT metadata persisted", {
      walletAddress: wallet.walletAddress,
      processedCount,
      skippedCount,
      durationMs: Date.now() - startTime,
    });
  }
}
