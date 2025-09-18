/*
  Warnings:

  - You are about to drop the column `nftMintId` on the `t_nft_instances` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nft_mint_id]` on the table `t_nft_instances` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "t_nft_instances" DROP CONSTRAINT "t_nft_instances_nftMintId_fkey";

-- DropIndex
DROP INDEX "t_nft_instances_nftMintId_key";

-- AlterTable
ALTER TABLE "t_nft_instances" DROP COLUMN "nftMintId",
ADD COLUMN     "nft_mint_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_instances_nft_mint_id_key" ON "t_nft_instances"("nft_mint_id");

-- AddForeignKey
ALTER TABLE "t_nft_instances" ADD CONSTRAINT "t_nft_instances_nft_mint_id_fkey" FOREIGN KEY ("nft_mint_id") REFERENCES "t_nft_mints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
