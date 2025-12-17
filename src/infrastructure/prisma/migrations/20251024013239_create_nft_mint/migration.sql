/*
  Warnings:

  - A unique constraint covering the columns `[nft_token_id,instance_id]` on the table `t_nft_instances` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nft_token_id` on table `t_nft_instances` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "NftInstanceStatus" AS ENUM ('STOCK', 'RESERVED', 'MINTING', 'OWNED', 'RETIRED');

-- CreateEnum
CREATE TYPE "NftMintStatus" AS ENUM ('QUEUED', 'SUBMITTED', 'MINTED', 'FAILED');

-- DropForeignKey
ALTER TABLE "t_nft_instances" DROP CONSTRAINT "t_nft_instances_nft_token_id_fkey";

-- DropForeignKey
ALTER TABLE "t_nft_instances" DROP CONSTRAINT "t_nft_instances_nft_wallet_id_fkey";

-- DropForeignKey
ALTER TABLE "t_nft_wallets" DROP CONSTRAINT "t_nft_wallets_user_id_fkey";

-- DropIndex
DROP INDEX "t_nft_instances_nft_wallet_id_instance_id_key";

-- AlterTable
ALTER TABLE "t_nft_instances" ADD COLUMN     "status" "NftInstanceStatus" NOT NULL DEFAULT 'STOCK',
ALTER COLUMN "nft_wallet_id" DROP NOT NULL,
ALTER COLUMN "nft_token_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "t_nft_mints" (
    "id" TEXT NOT NULL,
    "status" "NftMintStatus" NOT NULL DEFAULT 'QUEUED',
    "tx_hash" TEXT,
    "error" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "external_request_id" TEXT,
    "nft_wallet_id" TEXT NOT NULL,
    "nft_instance_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_nft_mints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_mints_tx_hash_key" ON "t_nft_mints"("tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_mints_external_request_id_key" ON "t_nft_mints"("external_request_id");

-- CreateIndex
CREATE INDEX "t_nft_mints_status_retry_count_created_at_idx" ON "t_nft_mints"("status", "retry_count", "created_at");

-- CreateIndex
CREATE INDEX "t_nft_instances_instance_id_idx" ON "t_nft_instances"("instance_id");

-- CreateIndex
CREATE INDEX "t_nft_instances_nft_wallet_id_idx" ON "t_nft_instances"("nft_wallet_id");

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_instances_nft_token_id_instance_id_key" ON "t_nft_instances"("nft_token_id", "instance_id");

-- AddForeignKey
ALTER TABLE "t_nft_wallets" ADD CONSTRAINT "t_nft_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_nft_instances" ADD CONSTRAINT "t_nft_instances_nft_token_id_fkey" FOREIGN KEY ("nft_token_id") REFERENCES "t_nft_tokens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_nft_instances" ADD CONSTRAINT "t_nft_instances_nft_wallet_id_fkey" FOREIGN KEY ("nft_wallet_id") REFERENCES "t_nft_wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_nft_mints" ADD CONSTRAINT "t_nft_mints_nft_wallet_id_fkey" FOREIGN KEY ("nft_wallet_id") REFERENCES "t_nft_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_nft_mints" ADD CONSTRAINT "t_nft_mints_nft_instance_id_fkey" FOREIGN KEY ("nft_instance_id") REFERENCES "t_nft_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
