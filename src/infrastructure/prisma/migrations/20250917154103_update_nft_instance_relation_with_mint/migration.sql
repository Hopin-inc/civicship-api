/*
  Warnings:

  - You are about to drop the column `nftInstanceId` on the `t_nft_mints` table. All the data in the column will be lost.
  - You are about to drop the column `nftWalletId` on the `t_nft_mints` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nftMintId]` on the table `t_nft_instances` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nftMintId` to the `t_nft_instances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nft_wallet_id` to the `t_nft_mints` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "t_nft_mints" DROP CONSTRAINT "t_nft_mints_nftInstanceId_fkey";

-- DropForeignKey
ALTER TABLE "t_nft_mints" DROP CONSTRAINT "t_nft_mints_nftWalletId_fkey";

-- DropIndex
DROP INDEX "t_nft_mints_nftInstanceId_key";

-- AlterTable
ALTER TABLE "t_nft_instances" ADD COLUMN     "nftMintId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "t_nft_mints" DROP COLUMN "nftInstanceId",
DROP COLUMN "nftWalletId",
ADD COLUMN     "nft_wallet_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_instances_nftMintId_key" ON "t_nft_instances"("nftMintId");

-- AddForeignKey
ALTER TABLE "t_nft_instances" ADD CONSTRAINT "t_nft_instances_nftMintId_fkey" FOREIGN KEY ("nftMintId") REFERENCES "t_nft_mints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_nft_mints" ADD CONSTRAINT "t_nft_mints_nft_wallet_id_fkey" FOREIGN KEY ("nft_wallet_id") REFERENCES "t_nft_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
