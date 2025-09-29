/*
  Warnings:

  - Made the column `nmkr_project_id` on table `t_nft_products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stripe_prouct_id` on table `t_nft_products` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "t_nft_products" ALTER COLUMN "nmkr_project_id" SET NOT NULL,
ALTER COLUMN "stripe_prouct_id" SET NOT NULL;
