/*
  Warnings:

  - Changed the type of `status` on the `t_nft_mints` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NftMintStatus" AS ENUM ('QUEUED', 'MINTED', 'FAILED');

-- AlterTable: Add temporary column with enum type
ALTER TABLE "t_nft_mints" ADD COLUMN "status_new" "NftMintStatus";

UPDATE "t_nft_mints" SET "status_new" = 
  CASE 
    WHEN "status" = 'QUEUED' THEN 'QUEUED'::"NftMintStatus"
    WHEN "status" = 'MINTED' THEN 'MINTED'::"NftMintStatus"
    WHEN "status" = 'FAILED' THEN 'FAILED'::"NftMintStatus"
    ELSE 'QUEUED'::"NftMintStatus"  -- Default fallback
  END;

ALTER TABLE "t_nft_mints" ALTER COLUMN "status_new" SET NOT NULL;

ALTER TABLE "t_nft_mints" DROP COLUMN "status";

ALTER TABLE "t_nft_mints" RENAME COLUMN "status_new" TO "status";
