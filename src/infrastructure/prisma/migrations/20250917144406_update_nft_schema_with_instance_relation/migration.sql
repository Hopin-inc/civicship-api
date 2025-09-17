/*
  Warnings:

  - A unique constraint covering the columns `[nftInstanceId]` on the table `t_nft_mints` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nftWalletId` to the `t_nft_mints` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "t_nft_mints" ADD COLUMN     "nftInstanceId" TEXT,
ADD COLUMN     "nftWalletId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'QUEUED';

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_mints_nftInstanceId_key" ON "t_nft_mints"("nftInstanceId");

-- AddForeignKey
ALTER TABLE "t_nft_mints" ADD CONSTRAINT "t_nft_mints_nftInstanceId_fkey" FOREIGN KEY ("nftInstanceId") REFERENCES "t_nft_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_nft_mints" ADD CONSTRAINT "t_nft_mints_nftWalletId_fkey" FOREIGN KEY ("nftWalletId") REFERENCES "t_nft_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
