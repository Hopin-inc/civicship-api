/*
  Warnings:

  - You are about to drop the column `nft_wallet_id` on the `t_nft_mints` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "t_nft_mints" DROP CONSTRAINT "t_nft_mints_nft_wallet_id_fkey";

-- AlterTable
ALTER TABLE "t_nft_mints" DROP COLUMN "nft_wallet_id";
