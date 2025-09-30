import { IContext } from "@/types/server";
import { NftWalletType, Prisma } from "@prisma/client";
import { injectable, inject } from "tsyringe";
import { fetchData } from "@/utils/fetch";
import logger from "@/infrastructure/logging";
import NFTWalletRepository from "@/application/domain/account/nft-wallet/data/repository";
import NftTokenRepository from "@/application/domain/account/nft-token/data/repository";
import NftInstanceRepository from "@/application/domain/account/nft-instance/data/repository";
import { BaseSepoliaNftResponse, BaseSepoliaTokenResponse } from "@/types/external/baseSepolia";
import { ValidationError } from "@/errors/graphql";
import { NmkrClient } from "@/infrastructure/libs/nmkr/api/client";
import { PrismaNftWalletDetail } from "@/application/domain/account/nft-wallet/data/type";
import crypto from "crypto";
import { KIBOTCHCA_PRODUCT_ID_BY_JUST_DAO_IT } from "@/application/domain/utils";

@injectable()
export default class NFTWalletService {
  constructor(
    @inject("NFTWalletRepository") private nftWalletRepository: NFTWalletRepository,
    @inject("NftTokenRepository") private nftTokenRepository: NftTokenRepository,
    @inject("NftInstanceRepository") private nftInstanceRepository: NftInstanceRepository,
    @inject("NmkrClient") private nmkrClient: NmkrClient,
  ) {}

  async createOrUpdateWalletAddress(
    ctx: IContext,
    userId: string,
    walletAddress: string,
    tx: Prisma.TransactionClient,
  ) {
    const existing = await this.nftWalletRepository.findByWalletAddress(ctx, walletAddress);
    if (existing) {
      if (existing.userId !== userId) {
        throw new ValidationError("This wallet address is already linked to another user.", [
          walletAddress,
        ]);
      }
      return existing;
    }

    return await this.nftWalletRepository.create(
      ctx,
      {
        walletAddress,
        type: NftWalletType.EXTERNAL,
        user: { connect: { id: userId } },
      },
      tx,
    );
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
      const response = await fetchData<BaseSepoliaNftResponse>(apiUrl);

      if (!response.items || response.items.length === 0) {
        logger.info(`📭 No NFTs found for wallet: ${wallet.walletAddress}`);
        return { success: true, itemsProcessed: 0 };
      }

      for (const item of response.items) {
        let tokenInfo: BaseSepoliaTokenResponse | null = null;
        try {
          const tokenApiUrl = `${baseApiUrl}/tokens/${item.token.address}`;
          tokenInfo = await fetchData<BaseSepoliaTokenResponse>(tokenApiUrl);
          logger.info(`🔄 Fetched latest token info for: ${item.token.address}`);
        } catch (tokenError) {
          logger.warn(`⚠️ Failed to fetch token info for ${item.token.address}:`, tokenError);
        }

        const tokenName = tokenInfo?.name || item.token.name;
        const tokenSymbol = tokenInfo?.symbol || item.token.symbol;
        const tokenType = tokenInfo?.type || item.token.type || "UNKNOWN";

        const nftToken = await this.nftTokenRepository.upsert(
          ctx,
          {
            address: item.token.address,
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
          KIBOTCHCA_PRODUCT_ID_BY_JUST_DAO_IT,
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

  async checkIfExists(ctx: IContext, userId: string, type: NftWalletType = NftWalletType.INTERNAL) {
    const existing = await this.nftWalletRepository.findByUserId(ctx, userId);
    if (existing && existing.type === type) {
      return existing;
    }
    return null;
  }

  async createInternalWallet(ctx: IContext, userId: string, walletAddress: string) {
    return await this.nftWalletRepository.create(ctx, {
      walletAddress,
      type: NftWalletType.INTERNAL,
      user: { connect: { id: userId } },
    });
  }

  async ensureNmkrWallet(ctx: IContext, userId: string): Promise<PrismaNftWalletDetail> {
    const existing = await this.checkIfExists(ctx, userId, NftWalletType.INTERNAL);
    if (existing) return existing;

    const walletResponse = await this.nmkrClient.createWallet({
      walletName: userId,
      enterpriseaddress: true,
      walletPassword: crypto.randomBytes(32).toString("hex"),
    });

    logger.debug("[NFTWalletService] Created NMKR Managed wallet", {
      userId,
      address: walletResponse.address,
    });

    return this.createInternalWallet(ctx, userId, walletResponse.address);
  }
}
