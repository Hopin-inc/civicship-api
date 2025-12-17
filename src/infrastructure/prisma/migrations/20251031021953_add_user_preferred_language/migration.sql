-- CreateEnum
CREATE TYPE "Language" AS ENUM ('JA', 'EN');

-- AlterTable
ALTER TABLE "t_users" ADD COLUMN     "preferred_language" "Language" NOT NULL DEFAULT 'JA';
