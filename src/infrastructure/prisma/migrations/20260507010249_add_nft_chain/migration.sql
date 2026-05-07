-- CreateEnum
CREATE TYPE "NftChain" AS ENUM ('BASE_SEPOLIA', 'BASE_MAINNET', 'CARDANO_PREPROD', 'CARDANO_MAINNET');

-- AlterTable
ALTER TABLE "t_nft_wallets" ADD COLUMN     "chain" "NftChain";

-- AlterTable
ALTER TABLE "t_nft_tokens" ADD COLUMN     "chain" "NftChain";

-- CreateIndex
CREATE INDEX "t_nft_wallets_chain_idx" ON "t_nft_wallets"("chain");

-- CreateIndex
CREATE INDEX "t_nft_tokens_chain_idx" ON "t_nft_tokens"("chain");

-- Backfill (既存データはバッチ syncNftMetadata 由来 = Base Sepolia)
UPDATE "t_nft_tokens" SET "chain" = 'BASE_SEPOLIA' WHERE "chain" IS NULL;

-- NftWallet の backfill: EXTERNAL は常に BASE_SEPOLIA。INTERNAL は env に依存するため
-- migration では一旦 NULL のまま残し、別途環境ごとに以下を実行する想定:
--   dev:  UPDATE t_nft_wallets SET chain = 'CARDANO_PREPROD' WHERE type = 'INTERNAL' AND chain IS NULL;
--   prd:  UPDATE t_nft_wallets SET chain = 'CARDANO_MAINNET' WHERE type = 'INTERNAL' AND chain IS NULL;
UPDATE "t_nft_wallets" SET "chain" = 'BASE_SEPOLIA' WHERE "type" = 'EXTERNAL' AND "chain" IS NULL;
