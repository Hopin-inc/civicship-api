/*
  Warnings:

  - A unique constraint covering the columns `[tx_hash]` on the table `t_nft_mints` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "NftInstanceStatus" AS ENUM ('STOCK', 'RESERVED', 'MINTING', 'OWNED', 'RETIRED');

-- DropForeignKey
ALTER TABLE "t_nft_instances" DROP CONSTRAINT "t_nft_instances_nft_wallet_id_fkey";

-- DropForeignKey
ALTER TABLE "t_nft_wallets" DROP CONSTRAINT "t_nft_wallets_user_id_fkey";

-- AlterTable
ALTER TABLE "t_nft_instances" ADD COLUMN     "status" "NftInstanceStatus" NOT NULL DEFAULT 'STOCK',
ALTER COLUMN "nft_wallet_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "t_nft_instances_nft_wallet_id_idx" ON "t_nft_instances"("nft_wallet_id");

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_mints_tx_hash_key" ON "t_nft_mints"("tx_hash");

-- AddForeignKey
ALTER TABLE "t_nft_wallets" ADD CONSTRAINT "t_nft_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_nft_instances" ADD CONSTRAINT "t_nft_instances_nft_wallet_id_fkey" FOREIGN KEY ("nft_wallet_id") REFERENCES "t_nft_wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
