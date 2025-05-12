-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('COMMUNITY', 'MEMBER');

-- AlterTable
ALTER TABLE "t_wallets" ADD COLUMN     "type" "WalletType" NOT NULL DEFAULT 'MEMBER';
