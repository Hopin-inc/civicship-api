import { IContext } from "@/types/server";
import { NftVendor } from "@prisma/client";
import { injectable, inject } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { AuthorizationError, NotFoundError } from "@/errors/graphql";
import NFTWalletService from "@/application/domain/account/nft-wallet/service";
import logger from "@/infrastructure/logging";
import { getErrorCode, getErrorType } from "@/utils/error";

export type SyncMetadataResult = {
  success: boolean;
  itemsProcessed: number;
  error?: string;
  errorCode?: string;
  errorType?: string;
};

export type RegisterWalletResult = {
  id: string;
  walletAddress: string;
  userId: string;
};

export type LinkVendorUserResult = {
  walletRef: string;
  wallet: { walletAddress: string; chain: string | null } | null;
};

export type RegisterWalletByRefResult = {
  created: boolean;
  wallet: { walletAddress: string; chain: string | null };
};

@injectable()
export default class NFTWalletUsecase {
  constructor(
    @inject("PrismaClientIssuer") private issuer: PrismaClientIssuer,
    @inject("NFTWalletService") private nftWalletService: NFTWalletService,
  ) {}

  async getByWalletAddress(ctx: IContext, walletAddress: string) {
    return this.nftWalletService.findByWalletAddress(ctx, walletAddress);
  }

  async registerWallet(
    ctx: IContext,
    userId: string,
    walletAddress: string,
    userName?: string,
    currentUserName?: string,
  ): Promise<RegisterWalletResult> {
    return await this.issuer.public(ctx, async (tx) => {
      const wallet = await this.nftWalletService.createOrUpdateWalletAddress(
        ctx,
        userId,
        walletAddress,
        tx,
      );

      if (userName && currentUserName === "名前未設定") {
        await tx.user.update({
          where: { id: userId },
          data: { name: userName },
        });
        // 名前は PII につき値はログに残さない (更新有無のみ)
        logger.debug("✅ Updated user name", { userId });
      }

      logger.debug("✅ Wallet registered", { userId, walletAddress });

      return {
        id: wallet.id,
        walletAddress: wallet.walletAddress,
        userId: wallet.userId,
      };
    });
  }

  /**
   * ログイン時に呼ぶ。(vendor, userId) の VendorUserLink を取得/生成し、
   * 不透明な walletRef と既存 wallet (あれば) を返す。
   * 業者は walletRef を保管し、後続の webhook で registerWalletByRef に渡す。
   */
  async linkVendorUser(
    ctx: IContext,
    vendor: NftVendor,
    userId: string,
  ): Promise<LinkVendorUserResult> {
    return this.issuer.public(ctx, async (tx) => {
      const link = await this.nftWalletService.linkVendorUser(ctx, vendor, userId, tx);
      const wallet = await this.nftWalletService.findByUserId(ctx, userId);

      return {
        walletRef: link.ref,
        wallet: wallet
          ? { walletAddress: wallet.walletAddress, chain: wallet.chain }
          : null,
      };
    });
  }

  /**
   * Shopify webhook など server-side から呼ぶ。walletRef で認証済みユーザーを解決し、
   * wallet を登録する。既存 wallet があれば上書きせずそれを返す (created: false)。
   */
  async registerWalletByRef(
    ctx: IContext,
    vendor: NftVendor,
    walletRef: string,
    walletAddress: string,
    name?: string,
  ): Promise<RegisterWalletByRefResult> {
    const link = await this.nftWalletService.resolveVendorUserLink(ctx, walletRef);
    if (!link) {
      // walletRef は不透明な secret として業者に渡しているので、エラー応答にも反映しない
      throw new NotFoundError("VendorUserLink");
    }
    if (link.vendor !== vendor) {
      throw new AuthorizationError("walletRef belongs to another vendor");
    }

    return this.issuer.public(ctx, async (tx) => {
      const { wallet, created } = await this.nftWalletService.getOrCreateWalletByUser(
        ctx,
        link.userId,
        walletAddress,
        tx,
      );

      if (created && name) {
        const user = await tx.user.findUnique({
          where: { id: link.userId },
          select: { name: true },
        });
        if (user?.name === "名前未設定") {
          await tx.user.update({ where: { id: link.userId }, data: { name } });
          // 名前は PII につき値はログに残さない (更新有無のみ)
          logger.debug("✅ Updated user name", { userId: link.userId });
        }
      }

      logger.debug("✅ Wallet registered by ref", {
        userId: link.userId,
        walletAddress: wallet.walletAddress,
        created,
      });

      return {
        created,
        wallet: { walletAddress: wallet.walletAddress, chain: wallet.chain },
      };
    });
  }

  async syncMetadata(
    ctx: IContext,
    wallet: { id: string; walletAddress: string },
  ): Promise<SyncMetadataResult> {
    const startTime = Date.now();
    
    try {
      logger.debug("🔄 Starting NFT metadata sync", { walletAddress: wallet.walletAddress });
      
      const metadata = await this.nftWalletService.fetchMetadata(wallet.walletAddress);

      if (metadata.items.length === 0) {
        await this.issuer.internal(async (tx) => {
          await tx.nftWallet.update({
            where: { id: wallet.id },
            data: { updatedAt: new Date() }
          });
        });

        logger.debug("📭 No NFTs found for wallet", {
          walletAddress: wallet.walletAddress,
          durationMs: Date.now() - startTime,
        });
        return { success: true, itemsProcessed: 0 };
      }

      logger.debug("📦 Fetching token info", {
        walletAddress: wallet.walletAddress,
        nftCount: metadata.items.length,
      });

      const tokenInfos = await this.nftWalletService.fetchTokenInfos(ctx, metadata);

      logger.debug("📥 Persisting to database", { 
        walletAddress: wallet.walletAddress,
        tokenCount: Object.keys(tokenInfos).length,
      });

      await this.issuer.internal(async (tx) => {
        await this.nftWalletService.persistMetadata(ctx, wallet, metadata, tokenInfos, tx);

        await tx.nftWallet.update({
          where: { id: wallet.id },
          data: { updatedAt: new Date() }
        });
      });

      logger.debug("✅ NFT metadata sync completed", {
        walletAddress: wallet.walletAddress,
        itemsProcessed: metadata.items.length,
        durationMs: Date.now() - startTime,
      });
      
      return { success: true, itemsProcessed: metadata.items.length };
    } catch (error) {
      // Update updatedAt even on error to prevent infinite retry loop
      try {
        await this.issuer.internal(async (tx) => {
          await tx.nftWallet.update({
            where: { id: wallet.id },
            data: { updatedAt: new Date() }
          });
        });
      } catch (updateError) {
        logger.error("🚨 Failed to update wallet updatedAt on sync error", {
          walletAddress: wallet.walletAddress,
          originalErrorMessage: error instanceof Error ? error.message : JSON.stringify(error),
          updateErrorMessage: updateError instanceof Error ? updateError.message : JSON.stringify(updateError),
        });
      }

      const errorCode = getErrorCode(error);
      const errorDetails = {
        walletAddress: wallet.walletAddress,
        durationMs: Date.now() - startTime,
        errorMessage: error instanceof Error ? error.message : JSON.stringify(error),
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorCode,
        errorType: getErrorType(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      };

      // Use warn level for timeout errors (temporary network issues)
      const isTimeout = errorCode === 'ETIMEDOUT';
      if (isTimeout) {
        logger.warn("⚠️ NFT metadata sync timeout", errorDetails);
      } else {
        logger.error("❌ NFT metadata sync failed", errorDetails);
      }

      return {
        success: false,
        itemsProcessed: 0,
        error: errorDetails.errorMessage,
        errorCode: errorDetails.errorCode,
        errorType: errorDetails.errorType,
      };
    }
  }
}
