/*
  Warnings:

  - You are about to drop the column `nft_mint_id` on the `t_nft_instances` table. All the data in the column will be lost.
  - You are about to drop the column `nft_wallet_id` on the `t_nft_mints` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[product_id,instance_id]` on the table `t_nft_instances` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[external_request_id]` on the table `t_nft_mints` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nft_instance_id]` on the table `t_nft_mints` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nft_instance_id` to the `t_nft_mints` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "t_nft_instances" DROP CONSTRAINT "t_nft_instances_nft_mint_id_fkey";

-- DropForeignKey
ALTER TABLE "t_nft_mints" DROP CONSTRAINT "t_nft_mints_nft_wallet_id_fkey";

-- DropIndex
DROP INDEX "t_nft_instances_nft_mint_id_key";

-- DropIndex
DROP INDEX "t_nft_instances_nft_wallet_id_instance_id_key";

-- DropIndex
DROP INDEX "t_nft_mints_created_at_id_idx";

-- DropIndex
DROP INDEX "t_nft_mints_order_item_id_key";

-- DropIndex
DROP INDEX "t_nft_mints_status_created_at_idx";

-- DropIndex
DROP INDEX "t_nft_mints_tx_hash_key";

-- AlterTable
ALTER TABLE "t_nft_instances" DROP COLUMN "nft_mint_id";

-- AlterTable
ALTER TABLE "t_nft_mints" DROP COLUMN "nft_wallet_id",
ADD COLUMN     "external_request_id" TEXT,
ADD COLUMN     "nft_instance_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "t_nft_instances_instance_id_idx" ON "t_nft_instances"("instance_id");

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_instances_product_id_instance_id_key" ON "t_nft_instances"("product_id", "instance_id");

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_mints_external_request_id_key" ON "t_nft_mints"("external_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_mints_nft_instance_id_key" ON "t_nft_mints"("nft_instance_id");

-- CreateIndex
CREATE INDEX "t_nft_mints_status_retry_count_created_at_idx" ON "t_nft_mints"("status", "retry_count", "created_at");

-- AddForeignKey
ALTER TABLE "t_nft_mints" ADD CONSTRAINT "t_nft_mints_nft_instance_id_fkey" FOREIGN KEY ("nft_instance_id") REFERENCES "t_nft_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
