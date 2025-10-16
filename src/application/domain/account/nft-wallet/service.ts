import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { injectable, inject } from "tsyringe";
import { fetchWithRetry } from "@/utils/retry";
import logger from "@/infrastructure/logging";
import NFTWalletRepository from "@/application/domain/account/nft-wallet/data/repository";
import NftTokenRepository from "@/application/domain/account/nft-token/data/repository";
import NftInstanceRepository from "@/application/domain/account/nft-instance/data/repository";
import { BaseSepoliaNftResponse, BaseSepoliaTokenResponse } from "@/types/external/baseSepolia";

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
  };
};

export type NftMetadata = {
  items: NftMetadataItem[];
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

  async findWalletByUserId(ctx: IContext, userId: string, tx?: Prisma.TransactionClient) {
    if (tx) {
      return this.nftWalletRepository.findByUserIdWithTx(ctx, userId, tx);
    }

    return this.nftWalletRepository.findByUserId(ctx, userId);
  }

  async fetchMetadata(walletAddress: string): Promise<NftMetadata> {
    try {
      const baseApiUrl =
        process.env.BASE_SEPOLIA_API_URL || "https://base-sepolia.blockscout.com/api/v2";
      const apiUrl = `${baseApiUrl}/addresses/${walletAddress}/nft`;
      
      logger.debug(`🌐 Fetching NFT list from Blockscout: ${walletAddress}`);
      const response = await fetchWithRetry<BaseSepoliaNftResponse>(
        apiUrl,
        MAX_RETRIES,
        RETRY_DELAY,
        TIMEOUT
      );

      if (!response.items?.length) {
        return { items: [] };
      }

      logger.info(`📥 Fetched ${response.items.length} NFTs from Blockscout`);
      return response;
    } catch (error) {
      logger.error(`❌ Failed to fetch NFT metadata for ${walletAddress}:`, error);
      throw error;
    }
  }

  async fetchTokenInfos(
    ctx: IContext,
    metadata: NftMetadata,
  ): Promise<Record<string, BaseSepoliaTokenResponse | null>> {
    const baseApiUrl =
      process.env.BASE_SEPOLIA_API_URL || "https://base-sepolia.blockscout.com/api/v2";
    const result: Record<string, BaseSepoliaTokenResponse | null> = {};

    for (const item of metadata.items) {
      const tokenAddress = item.token.address ?? item.token.address_hash;
      if (!tokenAddress) {
        continue;
      }

      const existingToken = await this.nftTokenRepository.findByAddress(ctx, tokenAddress);

      if (existingToken && existingToken.updatedAt && isTokenCacheValid(existingToken.updatedAt)) {
        result[tokenAddress] = {
          address: existingToken.address,
          name: existingToken.name ?? undefined,
          symbol: existingToken.symbol ?? undefined,
          type: existingToken.type,
        };
        logger.debug(`📦 Using cached token info for: ${tokenAddress}`);
      } else {
        try {
          const tokenApiUrl = `${baseApiUrl}/tokens/${tokenAddress}`;
          logger.debug(`🌐 Fetching token info: ${tokenAddress}`);
          const info = await fetchWithRetry<BaseSepoliaTokenResponse>(
            tokenApiUrl,
            MAX_RETRIES,
            RETRY_DELAY,
            TIMEOUT
          );
          result[tokenAddress] = info;
          logger.debug(`📥 Fetched token info for: ${tokenAddress}`);
        } catch (err) {
          logger.warn(`⚠️ Failed to fetch token info for ${tokenAddress}:`, err);
          result[tokenAddress] = null;
        }
      }
    }

    return result;
  }

  async persistMetadata(
    ctx: IContext,
    wallet: { id: string; walletAddress: string },
    metadata: NftMetadata,
    tokenInfos: Record<string, BaseSepoliaTokenResponse | null>,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    for (const item of metadata.items) {
      const tokenAddress = item.token.address ?? item.token.address_hash;
      if (!tokenAddress) {
        logger.warn(`⚠️ Missing token address, skipping NFT: ${item.id}`);
        continue;
      }

      const tokenInfo = tokenInfos[tokenAddress];
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
    }
  }

  async storeMetadata(
    ctx: IContext,
    wallet: { id: string; walletAddress: string },
    tx: Prisma.TransactionClient,
  ): Promise<{ success: boolean; itemsProcessed: number; error?: string }> {
    try {
      logger.info(`🔄 Processing wallet: ${wallet.walletAddress}`);

      const baseApiUrl =
        process.env.BASE_SEPOLIA_API_URL || "https://base-sepolia.blockscout.com/api/v2";
      const apiUrl = `${baseApiUrl}/addresses/${wallet.walletAddress}/nft`;
      
      const response = await fetchWithRetry<BaseSepoliaNftResponse>(
        apiUrl, 
        MAX_RETRIES, 
        RETRY_DELAY, 
        TIMEOUT
      );

      if (!response.items || response.items.length === 0) {
        logger.info(`📭 No NFTs found for wallet: ${wallet.walletAddress}`);
        return { success: true, itemsProcessed: 0 };
      }

      for (const item of response.items) {
        const tokenAddress = item.token.address ?? item.token.address_hash;
        if (!tokenAddress) {
          logger.warn(`⚠️ Missing token address, skipping NFT: ${item.id}`);
          continue;
        }

        let tokenInfo: BaseSepoliaTokenResponse | null = null;
        
        const existingToken = await this.nftTokenRepository.findByAddress(ctx, tokenAddress, tx);
        
        if (existingToken && existingToken.updatedAt && isTokenCacheValid(existingToken.updatedAt)) {
          tokenInfo = {
            address: existingToken.address,
            name: existingToken.name ?? undefined,
            symbol: existingToken.symbol ?? undefined,
            type: existingToken.type,
          };
          logger.debug(`📦 Using cached token info for: ${tokenAddress}`);
        } else {
          try {
            const tokenApiUrl = `${baseApiUrl}/tokens/${tokenAddress}`;
            tokenInfo = await fetchWithRetry<BaseSepoliaTokenResponse>(
              tokenApiUrl,
              MAX_RETRIES,
              RETRY_DELAY,
              TIMEOUT
            );
            logger.info(`🔄 Fetched latest token info for: ${tokenAddress}`);
          } catch (tokenError) {
            logger.warn(`⚠️ Failed to fetch token info for ${tokenAddress}:`, tokenError);
          }
        }

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
      }

      logger.info(`✅ Processed ${response.items.length} NFTs for wallet: ${wallet.walletAddress}`);
      return { success: true, itemsProcessed: response.items.length };
    } catch (error) {
      logger.error(`❌ Error processing wallet ${wallet.walletAddress}:`, error);
      return {
        success: false,
        itemsProcessed: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
