/*
  Warnings:

  - A unique constraint covering the columns `[wallet_address]` on the table `t_nft_wallets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "t_nft_wallets_wallet_address_key" ON "t_nft_wallets"("wallet_address");
