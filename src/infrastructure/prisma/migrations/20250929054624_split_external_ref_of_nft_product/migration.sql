/*
  Warnings:

  - You are about to drop the column `external_ref` on the `t_nft_products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "t_nft_products" DROP COLUMN "external_ref",
ADD COLUMN     "nmkr_project_id" TEXT,
ADD COLUMN     "stripe_prouct_id" TEXT;
