-- CreateEnum
CREATE TYPE "NftVendor" AS ENUM ('BORDERLESS', 'KIBOTCHA');

-- AlterTable
ALTER TABLE "m_api_keys" ADD COLUMN     "vendor" "NftVendor";

-- AlterTable
ALTER TABLE "t_nft_tokens" ADD COLUMN     "issued_by_vendor" "NftVendor";

-- CreateIndex
CREATE INDEX "t_nft_tokens_issued_by_vendor_idx" ON "t_nft_tokens"("issued_by_vendor");
