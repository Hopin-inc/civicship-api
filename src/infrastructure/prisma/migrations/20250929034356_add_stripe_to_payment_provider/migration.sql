/*
  Warnings:

  - You are about to drop the column `api_key` on the `t_nft_wallets` table. All the data in the column will be lost.
  - You are about to drop the column `external_ref` on the `t_nft_wallets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "t_nft_wallets" DROP COLUMN "api_key",
DROP COLUMN "external_ref";
