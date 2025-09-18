/*
  Warnings:

  - You are about to drop the column `asset_name` on the `t_nft_mints` table. All the data in the column will be lost.
  - You are about to drop the column `policy_id` on the `t_nft_mints` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nft_product_id,sequence_num]` on the table `t_nft_mints` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nft_product_id` to the `t_nft_mints` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NftWalletType" AS ENUM ('INTERNAL', 'EXTERNAL');

-- DropForeignKey
ALTER TABLE "t_nft_instances" DROP CONSTRAINT "t_nft_instances_nft_token_id_fkey";

-- DropIndex
DROP INDEX "t_nft_mints_policy_id_asset_name_key";

-- DropIndex
DROP INDEX "t_nft_mints_policy_id_created_at_idx";

-- DropIndex
DROP INDEX "t_nft_mints_policy_id_sequence_num_key";

-- DropIndex
DROP INDEX "t_nft_wallets_user_id_key";

-- AlterTable
ALTER TABLE "t_nft_instances" ADD COLUMN     "community_id" TEXT;

-- AlterTable
ALTER TABLE "t_nft_mints" DROP COLUMN "asset_name",
DROP COLUMN "policy_id",
ADD COLUMN     "nft_product_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "t_nft_wallets" ADD COLUMN     "type" "NftWalletType" NOT NULL DEFAULT 'INTERNAL';

-- CreateTable
CREATE TABLE "t_nft_products" (
    "id" TEXT NOT NULL,
    "policy_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "price" INTEGER,
    "max_supply" INTEGER,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_nft_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_mints_nft_product_id_sequence_num_key" ON "t_nft_mints"("nft_product_id", "sequence_num");

-- AddForeignKey
ALTER TABLE "t_nft_instances" ADD CONSTRAINT "t_nft_instances_nft_token_id_fkey" FOREIGN KEY ("nft_token_id") REFERENCES "t_nft_tokens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_nft_instances" ADD CONSTRAINT "t_nft_instances_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "t_communities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_nft_mints" ADD CONSTRAINT "t_nft_mints_nft_product_id_fkey" FOREIGN KEY ("nft_product_id") REFERENCES "t_nft_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
