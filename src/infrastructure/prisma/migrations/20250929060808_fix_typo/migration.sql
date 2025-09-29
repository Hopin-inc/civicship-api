/*
  Warnings:

  - You are about to drop the column `stripe_prouct_id` on the `t_nft_products` table. All the data in the column will be lost.
  - Added the required column `stripe_product_id` to the `t_nft_products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "t_nft_products" DROP COLUMN "stripe_prouct_id",
ADD COLUMN     "stripe_product_id" TEXT NOT NULL;
