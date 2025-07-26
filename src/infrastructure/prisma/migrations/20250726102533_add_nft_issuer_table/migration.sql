/*
  Warnings:

  - Added the required column `issuer_address` to the `t_nft_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "t_nft_tokens" ADD COLUMN     "issuer_address" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "t_nft_issuers" (
    "address" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_nft_issuers_pkey" PRIMARY KEY ("address")
);

-- AddForeignKey
ALTER TABLE "t_nft_tokens" ADD CONSTRAINT "t_nft_tokens_issuer_address_fkey" FOREIGN KEY ("issuer_address") REFERENCES "t_nft_issuers"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
