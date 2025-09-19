/*
  Warnings:

  - A unique constraint covering the columns `[wallet_address]` on the table `t_nft_wallets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "NftWalletType" AS ENUM ('INTERNAL', 'EXTERNAL');

-- DropIndex
DROP INDEX "t_nft_wallets_user_id_key";

-- AlterTable
ALTER TABLE "t_nft_wallets" ADD COLUMN     "type" "NftWalletType" NOT NULL DEFAULT 'INTERNAL';

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_wallets_wallet_address_key" ON "t_nft_wallets"("wallet_address");
