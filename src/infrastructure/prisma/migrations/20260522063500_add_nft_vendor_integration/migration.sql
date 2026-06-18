-- 外部業者向け NFT 連携 API (PR #923) のスキーマ変更を 1 本にまとめたもの。
-- NftVendor / NftChain enum、ApiKey.vendor、NftToken.issuedByVendor + chain、
-- NftWallet.chain、VendorUserLink テーブルを追加する。すべて additive。

-- CreateEnum
CREATE TYPE "NftVendor" AS ENUM ('BORDERLESS', 'KIBOTCHA');

-- CreateEnum
CREATE TYPE "NftChain" AS ENUM ('BASE_SEPOLIA', 'BASE_MAINNET', 'POLYGON_MAINNET', 'POLYGON_AMOY', 'CARDANO_PREPROD', 'CARDANO_MAINNET');

-- AlterTable
ALTER TABLE "m_api_keys" ADD COLUMN     "vendor" "NftVendor";

-- AlterTable
ALTER TABLE "t_nft_tokens" ADD COLUMN     "issued_by_vendor" "NftVendor",
ADD COLUMN     "chain" "NftChain";

-- AlterTable
ALTER TABLE "t_nft_wallets" ADD COLUMN     "chain" "NftChain";

-- CreateTable
CREATE TABLE "t_vendor_user_links" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "vendor" "NftVendor" NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_vendor_user_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "t_nft_tokens_issued_by_vendor_idx" ON "t_nft_tokens"("issued_by_vendor");

-- CreateIndex
CREATE INDEX "t_nft_tokens_chain_idx" ON "t_nft_tokens"("chain");

-- CreateIndex
CREATE INDEX "t_nft_wallets_chain_idx" ON "t_nft_wallets"("chain");

-- CreateIndex
CREATE UNIQUE INDEX "t_vendor_user_links_ref_key" ON "t_vendor_user_links"("ref");

-- CreateIndex
CREATE INDEX "t_vendor_user_links_user_id_idx" ON "t_vendor_user_links"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "t_vendor_user_links_vendor_user_id_key" ON "t_vendor_user_links"("vendor", "user_id");

-- AddForeignKey
ALTER TABLE "t_vendor_user_links" ADD CONSTRAINT "t_vendor_user_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: 既存 NftToken はバッチ syncNftMetadata 由来 = Base Sepolia。
-- NftWallet.chain は EXTERNAL では NULL のまま (EVM EOA は複数チェーン共通)、
-- INTERNAL は env 依存のためデプロイ時に環境別 SQL で手動 backfill する
-- (docs/external-nft-api-deploy.md 参照)。
UPDATE "t_nft_tokens" SET "chain" = 'BASE_SEPOLIA' WHERE "chain" IS NULL;
